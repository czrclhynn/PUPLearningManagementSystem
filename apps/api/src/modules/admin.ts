import type { FastifyInstance } from "fastify";
import type { Pool, PoolClient } from "pg";
import { transaction } from "../database.js";
import { hashPassword } from "../password.js";
import { currentUser, reject } from "./auth.js";

const uuid = { type: "string", pattern: "^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$" };
const statusField = { type: "string", enum: ["Active", "Inactive"] };
const roleField = { type: "string", enum: ["Student", "Instructor"] };
const passwordField = { type: "string", minLength: 12, maxLength: 128 };
const nameField = { type: "string", minLength: 1, maxLength: 120, pattern: "\\S" };
const userFields = {
  name: nameField,
  email: { type: "string", maxLength: 254, pattern: "^\\s*[^\\s@]+@[^\\s@]+\\.[^\\s@]+\\s*$" },
  password: passwordField,
  status: statusField,
};
const courseFields = {
  course_code: { type: "string", minLength: 1, maxLength: 32, pattern: "\\S" },
  course_name: nameField,
  description: { type: "string", maxLength: 4000 },
  instructor_id: uuid,
  status: statusField,
};
const enrollmentFields = { student_id: uuid, course_id: uuid };
const idParams = { type: "object", required: ["id"], properties: { id: uuid } };
const body = (properties: object, required: string[]) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
type Status = "Active" | "Inactive";
type IdParams = { id: string };
type AccountInput = { name: string; email: string; password?: string; status: Status };
type CourseInput = {
  course_code: string;
  course_name: string;
  description?: string;
  instructor_id: string;
  status: Status;
};
type EnrollmentInput = { student_id: string; course_id: string };

async function canEnroll(db: PoolClient, studentId: string, courseId: string) {
  const student = await db.query(
    "SELECT 1 FROM lms.users WHERE id = $1 AND role = 'Student' AND status = 'Active' FOR SHARE",
    [studentId],
  );
  if (!student.rowCount) return false;
  const course = await db.query(
    "SELECT 1 FROM lms.courses WHERE id = $1 AND status = 'Active' FOR SHARE",
    [courseId],
  );
  return !!course.rowCount;
}

export function registerAdmin(app: FastifyInstance, pool: Pool) {
  app.register(
    async (admin) => {
      admin.addHook("onRequest", async (request, reply) => {
        const user = await currentUser(pool, request);
        if (!user) return reject(reply, 401, "Sign in to continue.");
        if (user.role !== "Administrator")
          return reject(reply, 403, "Administrator access is required.");
      });

      admin.get("/dashboard", async () =>
        transaction(pool, async (db) => {
          await db.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY");
          const stats = await db.query(`
        SELECT count(*)::int AS users, count(*) FILTER (WHERE status = 'Active')::int AS active_users,
           count(*) FILTER (WHERE role = 'Student')::int AS students,
           count(*) FILTER (WHERE role = 'Student' AND status = 'Active')::int AS active_students,
           count(*) FILTER (WHERE role = 'Instructor')::int AS instructors,
           count(*) FILTER (WHERE role = 'Instructor' AND status = 'Active')::int AS active_instructors,
           count(*) FILTER (WHERE role = 'Administrator')::int AS administrators,
           count(*) FILTER (WHERE role = 'Administrator' AND status = 'Active')::int AS active_administrators,
           (SELECT count(*)::int FROM lms.courses) AS courses,
           (SELECT count(*)::int FROM lms.courses WHERE status = 'Active') AS active_courses,
           (SELECT count(*)::int FROM lms.enrollments) AS enrollments,
           (SELECT count(*)::int FROM lms.enrollments e
              JOIN lms.users u ON u.id = e.student_id JOIN lms.courses c ON c.id = e.course_id
              WHERE e.status = 'Active' AND u.status = 'Active' AND c.status = 'Active') AS active_enrollments
        FROM lms.users
      `);
          const accounts = await db.query(
            "SELECT id, name, email, role, status, instructor_approval FROM lms.users ORDER BY lower(name), id",
          );
          const courses = await db.query(`
        SELECT c.id, c.course_code, c.course_name, c.description, c.instructor_id, c.status,
          u.name AS instructor_name, u.status AS instructor_status
        FROM lms.courses c JOIN lms.users u ON u.id = c.instructor_id ORDER BY c.course_code
      `);
          const enrollments = await db.query(`
        SELECT e.id, e.student_id, e.course_id, e.enrollment_date, e.status,
          u.name AS student_name, c.course_code, c.course_name,
          u.status AS student_status, c.status AS course_status
        FROM lms.enrollments e JOIN lms.users u ON u.id = e.student_id
          JOIN lms.courses c ON c.id = e.course_id ORDER BY e.enrollment_date DESC, e.id
      `);
          const signIns = await db.query(`
        SELECT to_char(day, 'YYYY-MM-DD') AS day, count(u.id)::int AS accounts
        FROM generate_series(current_date - 6, current_date, interval '1 day') AS dates(day)
        LEFT JOIN lms.users u ON u.last_login_at >= day AND u.last_login_at < day + interval '1 day'
        GROUP BY day ORDER BY day
      `);
          const recent = await db.query(`
        SELECT * FROM (
          SELECT id, 'Account' AS kind, name AS label, status, updated_at FROM lms.users
          UNION ALL
          SELECT id, 'Course', course_code || ' · ' || course_name, status, updated_at FROM lms.courses
          UNION ALL
          SELECT e.id, 'Enrollment', u.name || ' · ' || c.course_code, e.status, e.updated_at
          FROM lms.enrollments e JOIN lms.users u ON u.id = e.student_id
            JOIN lms.courses c ON c.id = e.course_id
        ) AS changes ORDER BY updated_at DESC, id LIMIT 8
      `);
          return {
            stats: stats.rows[0],
            accounts: accounts.rows,
            courses: courses.rows,
            enrollments: enrollments.rows,
            signIns: signIns.rows,
            recent: recent.rows,
          };
        }),
      );

      admin.post<{ Body: AccountInput & { role: "Instructor" | "Student"; password: string } }>(
        "/accounts",
        {
          schema: {
            body: body({ ...userFields, role: roleField }, [
              "name",
              "email",
              "password",
              "status",
              "role",
            ]),
          },
        },
        async (request, reply) => {
          const { name, email, role, status, password } = request.body;
          const { rows } = await pool.query(
            `INSERT INTO lms.users (name, email, role, status, password_hash, instructor_approval)
           VALUES ($1, $2, $3, $4, $5, CASE WHEN $3 = 'Instructor' THEN 'Approved' END)
           ON CONFLICT (email) DO NOTHING RETURNING id`,
            [name.trim(), email.trim().toLowerCase(), role, status, await hashPassword(password)],
          );
          return rows[0]
            ? reply.code(201).send(rows[0])
            : reject(reply, 409, "That email is already registered.");
        },
      );

      admin.put<{ Params: IdParams; Body: AccountInput }>(
        "/accounts/:id",
        { schema: { params: idParams, body: body(userFields, ["name", "email", "status"]) } },
        async (request, reply) => {
          const { name, email, status, password } = request.body;
          const hash = password ? await hashPassword(password) : null;
          try {
            const found = await transaction(pool, async (db) => {
              const updated = await db.query(
                `UPDATE lms.users SET name = $1, email = $2, status = $3,
                   password_hash = coalesce($4, password_hash), updated_at = now()
               WHERE id = $5 AND (role = 'Student' OR instructor_approval = 'Approved')`,
                [name.trim(), email.trim().toLowerCase(), status, hash, request.params.id],
              );
              if (updated.rowCount && (status === "Inactive" || hash)) {
                await db.query("DELETE FROM lms.sessions WHERE user_id = $1", [request.params.id]);
              }
              return updated.rowCount;
            });
            return found
              ? reply.code(204).send()
              : reject(reply, 404, "Student or instructor account not found.");
          } catch (error) {
            if ((error as { code?: string }).code === "23505")
              return reject(reply, 409, "That email is already registered.");
            throw error;
          }
        },
      );

      admin.patch<{ Params: IdParams; Body: { decision: "Approved" | "Rejected" } }>(
        "/accounts/:id/instructor-approval",
        {
          schema: {
            params: idParams,
            body: body({ decision: { type: "string", enum: ["Approved", "Rejected"] } }, [
              "decision",
            ]),
          },
        },
        async (request, reply) => {
          const { decision } = request.body;
          const { rowCount } = await pool.query(
            `UPDATE lms.users SET instructor_approval = $1,
               status = CASE WHEN $1 = 'Approved' THEN 'Active' ELSE 'Inactive' END, updated_at = now()
             WHERE id = $2 AND role = 'Instructor' AND instructor_approval = 'Pending'`,
            [decision, request.params.id],
          );
          return rowCount
            ? reply.code(204).send()
            : reject(reply, 409, "This instructor request is no longer pending.");
        },
      );

      const courseBody = body(courseFields, [
        "course_code",
        "course_name",
        "instructor_id",
        "status",
      ]);
      admin.route<{ Params: IdParams; Body: CourseInput }>({
        method: "PUT",
        url: "/courses/:id",
        schema: { params: idParams, body: courseBody },
        handler: async (request, reply) => saveCourse(pool, request.body, reply, request.params.id),
      });
      admin.post<{ Body: CourseInput }>(
        "/courses",
        { schema: { body: courseBody } },
        async (request, reply) => saveCourse(pool, request.body, reply),
      );

      admin.post<{ Body: EnrollmentInput }>(
        "/enrollments",
        { schema: { body: body(enrollmentFields, ["student_id", "course_id"]) } },
        async (request, reply) => {
          const { student_id, course_id } = request.body;
          const result = await transaction(pool, async (db) => {
            if (!(await canEnroll(db, student_id, course_id))) return "unavailable";
            const { rows } = await db.query(
              `INSERT INTO lms.enrollments (student_id, course_id) VALUES ($1, $2)
             ON CONFLICT (student_id, course_id) DO NOTHING RETURNING id`,
              [student_id, course_id],
            );
            return rows[0] ?? null;
          });
          if (result === "unavailable")
            return reject(reply, 422, "Choose an active student and course.");
          return result
            ? reply.code(201).send(result)
            : reject(
                reply,
                409,
                "This enrollment already exists. Reactivate it if it is inactive.",
              );
        },
      );

      admin.patch<{ Params: IdParams; Body: { status: Status } }>(
        "/enrollments/:id",
        { schema: { params: idParams, body: body({ status: statusField }, ["status"]) } },
        async (request, reply) => {
          const { id } = request.params;
          const { status } = request.body;
          const result = await transaction(pool, async (db) => {
            const { rows } = await db.query<EnrollmentInput>(
              "SELECT student_id, course_id FROM lms.enrollments WHERE id = $1",
              [id],
            );
            if (!rows[0]) return "missing";
            if (
              status === "Active" &&
              !(await canEnroll(db, rows[0].student_id, rows[0].course_id))
            )
              return "unavailable";
            await db.query(
              "UPDATE lms.enrollments SET status = $1, updated_at = now() WHERE id = $2",
              [status, id],
            );
            return "saved";
          });
          if (result === "missing") return reject(reply, 404, "Enrollment not found.");
          if (result === "unavailable")
            return reject(reply, 422, "The student and course must both be active.");
          return reply.code(204).send();
        },
      );
    },
    { prefix: "/admin" },
  );
}

async function saveCourse(
  pool: Pool,
  course: CourseInput,
  reply: Parameters<typeof reject>[0],
  id?: string,
) {
  const { course_code, course_name, description = "", instructor_id, status } = course;
  try {
    const result = await transaction(pool, async (db) => {
      const instructor = await db.query(
        "SELECT status FROM lms.users WHERE id = $1 AND role = 'Instructor' FOR SHARE",
        [instructor_id],
      );
      if (!instructor.rows[0]) return "instructor";
      const current = id
        ? await db.query("SELECT instructor_id, status FROM lms.courses WHERE id = $1 FOR UPDATE", [
            id,
          ])
        : undefined;
      if (current && !current.rowCount) return "missing";
      const previous = current?.rows[0];
      if (
        instructor.rows[0].status !== "Active" &&
        ((status === "Active" && previous?.status !== "Active") ||
          previous?.instructor_id !== instructor_id)
      ) {
        return "instructor";
      }
      const values = [
        course_code.trim().toUpperCase(),
        course_name.trim(),
        description.trim(),
        instructor_id,
        status,
      ];
      if (id) {
        await db.query(
          `
          UPDATE lms.courses SET course_code = $1, course_name = $2, description = $3,
            instructor_id = $4, status = $5, updated_at = now() WHERE id = $6
        `,
          [...values, id],
        );
        return "saved";
      }
      const { rows } = await db.query(
        `
        INSERT INTO lms.courses (course_code, course_name, description, instructor_id, status)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `,
        values,
      );
      return { id: rows[0].id };
    });
    if (result === "missing") return reject(reply, 404, "Course not found.");
    if (result === "instructor") return reject(reply, 422, "Choose an active instructor.");
    if (result === "saved") return reply.code(204).send();
    return reply.code(201).send(result);
  } catch (error) {
    if ((error as { code?: string }).code === "23505")
      return reject(reply, 409, "That course code is already in use.");
    throw error;
  }
}
