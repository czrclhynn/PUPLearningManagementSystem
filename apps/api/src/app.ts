import Fastify from "fastify";
import type { Pool } from "pg";
import { registerAdmin } from "./modules/admin.js";
import { registerAuth, reject } from "./modules/auth.js";
import { registerHealthRoutes } from "./modules/health/routes.js";
import { registerLearning } from "./modules/learning.js";

export function createApp(pool?: Pool, secureCookie = false) {
  const app = Fastify({
    logger: false,
    bodyLimit: 32768,
    ajv: { customOptions: { coerceTypes: false } },
  });
  app.register(registerHealthRoutes);
  if (pool) {
    app.register(
      async (api) => {
        api.addHook("onRequest", async (request, reply) => {
          reply.header("Cache-Control", "no-store");
          if (
            ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
            request.headers["x-lms-request"] !== "1"
          )
            return reject(reply, 403, "Request could not be verified.");
        });
        api.get("/health/database", async (_request, reply) => {
          const { rows } = await pool.query(`
          SELECT ssl, to_regclass('lms.users') IS NOT NULL AS migrated
          FROM pg_stat_ssl WHERE pid = pg_backend_pid()
        `);
          return rows[0]?.migrated
            ? { status: "ok", ssl: rows[0].ssl }
            : reject(reply, 503, "Database migration is required.");
        });
        registerAuth(api, pool, secureCookie);
        registerAdmin(api, pool);
        registerLearning(api, pool);
      },
      { prefix: "/api" },
    );
  }
  app.setErrorHandler(
    (
      error: Error & { statusCode?: number; code?: string; validation?: unknown },
      _request,
      reply,
    ) => {
      if (error.validation) return reject(reply, 400, "Check the required fields and try again.");
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return reject(reply, error.statusCode, "Invalid request.");
      }
      if (pool && (error.code || /timeout|connection/i.test(error.message))) {
        app.log.error({ code: error.code }, "LMS request failed");
        return reject(reply, 503, "The database is temporarily unavailable. Try again.");
      }
      return reject(reply, 500, "Internal Server Error");
    },
  );
  return app;
}
