import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { transaction } from "../database.js";
import { hashPassword, verifyPassword } from "../password.js";

export type Role = "Administrator" | "Instructor" | "Student";
export type User = { id: string; name: string; email: string; role: Role };

const cookie = "pup_session";
const sessionHours = 12;
const rememberHours = 7 * 24;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function requestToken(request: FastifyRequest) {
  const match = /(?:^|;\s*)pup_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie ?? "");
  return match ? hashToken(match[1]) : null;
}

export function reject(reply: FastifyReply, status: number, error: string) {
  return reply.code(status).send({ error });
}

export async function currentUser(pool: Pool, request: FastifyRequest) {
  const token = requestToken(request);
  if (!token) return null;
  const { rows } = await pool.query<User>(
    `SELECT u.id, u.name, u.email, u.role
     FROM lms.sessions s JOIN lms.users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.status = 'Active'`,
    [token],
  );
  return rows[0] ?? null;
}

export function registerAuth(app: FastifyInstance, pool: Pool, secure: boolean) {
  const cookieAttributes = `Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
  const attempts = new Map<string, { count: number; reset: number }>();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [ip, attempt] of attempts) if (attempt.reset <= now) attempts.delete(ip);
  }, 60000).unref();
  app.addHook("onClose", async () => clearInterval(sweep));

  function allowAttempt(key: string, limit: number) {
    const now = Date.now();
    const attempt = attempts.get(key);
    if (attempt && attempt.reset > now && attempt.count >= limit) return false;
    if (!attempt && attempts.size >= 10000) return false;
    attempts.set(
      key,
      attempt && attempt.reset > now
        ? { ...attempt, count: attempt.count + 1 }
        : { count: 1, reset: now + 5 * 60000 },
    );
    return true;
  }

  app.post<{ Body: { name: string; email: string; password: string } }>(
    "/auth/instructor-registration",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", maxLength: 120, pattern: "\\S" },
            email: { type: "string", maxLength: 254, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
            password: { type: "string", minLength: 12, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      if (!allowAttempt(`instructor:${request.ip}`, 8))
        return reject(reply, 429, "Too many registration attempts. Try again in a few minutes.");
      const { name, email, password } = request.body;
      await pool.query(
        `INSERT INTO lms.users (name, email, password_hash, role, status, instructor_approval)
         VALUES ($1, $2, $3, 'Instructor', 'Inactive', 'Pending')
         ON CONFLICT (email) DO NOTHING`,
        [name.trim(), email.toLowerCase(), await hashPassword(password)],
      );
      return reply
        .code(202)
        .send({
          message: "If this email is available, your request will appear in administrator review.",
        });
    },
  );

  app.get("/auth/session", async (request, reply) => {
    const user = await currentUser(pool, request);
    return user ?? reject(reply, 401, "Sign in to continue.");
  });

  app.post<{ Body: { email: string; password: string; remember?: boolean } }>(
    "/auth/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", minLength: 1, maxLength: 254 },
            password: { type: "string", minLength: 1, maxLength: 128 },
            remember: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      if (!allowAttempt(request.ip, 15)) {
        return reject(reply, 429, "Too many sign-in attempts. Try again in a few minutes.");
      }

      const { email, password, remember } = request.body;
      const record = await pool.query<User & { status: string; password_hash: string }>(
        "SELECT id, name, email, role, status, password_hash FROM lms.users WHERE email = $1",
        [email.trim().toLowerCase()],
      );
      const account = record.rows[0];
      if (
        !(await verifyPassword(password, account?.password_hash)) ||
        account?.status !== "Active"
      ) {
        return reject(
          reply,
          401,
          "That email or password is incorrect, or the account is inactive.",
        );
      }

      const token = randomBytes(32).toString("hex");
      const age = (remember ? rememberHours : sessionHours) * 3600;
      const user = await transaction(pool, async (db) => {
        const verified = await db.query<User>(
          `UPDATE lms.users SET last_login_at = now()
           WHERE id = $1 AND status = 'Active' AND password_hash = $2
           RETURNING id, name, email, role`,
          [account.id, account.password_hash],
        );
        if (!verified.rowCount) return null;
        await db.query("DELETE FROM lms.sessions WHERE expires_at <= now() OR token_hash = $1", [
          requestToken(request),
        ]);
        await db.query(
          "INSERT INTO lms.sessions VALUES ($1, $2, now() + $3 * interval '1 second')",
          [hashToken(token), account.id, age],
        );
        return verified.rows[0];
      });
      if (!user) return reject(reply, 401, "Your account changed. Please sign in again.");
      attempts.delete(request.ip);
      reply.header(
        "Set-Cookie",
        `${cookie}=${token}; ${cookieAttributes}${remember ? `; Max-Age=${age}` : ""}`,
      );
      return user;
    },
  );

  app.post("/auth/logout", async (request, reply) => {
    const token = requestToken(request);
    if (token) await pool.query("DELETE FROM lms.sessions WHERE token_hash = $1", [token]);
    return reply
      .header("Set-Cookie", `${cookie}=; ${cookieAttributes}; Max-Age=0`)
      .code(204)
      .send();
  });
}
