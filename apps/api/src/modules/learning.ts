import type { FastifyInstance, FastifyReply } from "fastify";
import type { Pool, PoolClient } from "pg";
import { transaction } from "../database.js";
import { currentUser, reject, type User } from "./auth.js";

declare module "fastify" {
  interface FastifyRequest {
    learningUser: User | null;
  }
}

const uuid = { type: "string", pattern: "^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$" };
const object = (properties: object, required: string[]) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
const courseParams = object({ id: uuid }, ["id"]);
const activityParams = object({ id: uuid, activityId: uuid }, ["id", "activityId"]);
const gradeParams = object({ id: uuid, activityId: uuid, submissionId: uuid }, [
  "id",
  "activityId",
  "submissionId",
]);
const activityBody = object(
  {
    title: { type: "string", maxLength: 160, pattern: "\\S" },
    description: { type: "string", maxLength: 5000, pattern: "\\S" },
    due_date: {
      type: "string",
      maxLength: 40,
      pattern: "^\\d{4}-\\d{2}-\\d{2}T.*(?:Z|[+-]\\d{2}:\\d{2})$",
    },
    max_points: { type: "number", minimum: 0.01, maximum: 99999.99 },
    material_url: { type: "string", maxLength: 2000 },
  },
  ["title", "description", "due_date", "max_points"],
);
type CourseParams = { id: string };
type ActivityParams = CourseParams & { activityId: string };
type ActivityInput = {
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  material_url?: string;
};

const details =
  "c.id, c.course_code, c.course_name, c.description, c.status, u.name AS instructor_name";
const activityColumns =
  "a.id, a.course_id, a.title, a.description, a.due_date, a.created_at, a.updated_at, a.max_points::float8 AS max_points, a.material_url, a.status";
const submissionColumns = `s.id AS submission_id, s.student_id, s.submission_content,
  s.submitted_at, s.status AS submission_status, g.grade::float8 AS score, g.feedback, g.graded_at`;
const studentCourses = `FROM lms.enrollments e JOIN lms.courses c ON c.id = e.course_id
  JOIN lms.users u ON u.id = c.instructor_id
  WHERE e.student_id = $1 AND e.status = 'Active' AND c.status = 'Active'`;

function inaccessible(reply: FastifyReply) {
  return reject(reply, 404, "This record is unavailable in your workspace.");
}

async function availableCourse(db: PoolClient, id: string, user: User) {
  const locked = await db.query(
    "SELECT 1 FROM lms.users WHERE id = $1 AND status = 'Active' FOR SHARE",
    [user.id],
  );
  if (!locked.rowCount) return false;
  const course = await db.query(
    `SELECT 1 FROM lms.courses WHERE id = $1 AND status = 'Active'
     AND ($2 <> 'Instructor' OR instructor_id = $3) FOR SHARE`,
    [id, user.role, user.id],
  );
  if (!course.rowCount) return false;
  if (user.role === "Instructor") return true;
  const enrollment = await db.query(
    "SELECT 1 FROM lms.enrollments WHERE course_id = $1 AND student_id = $2 AND status = 'Active' FOR SHARE",
    [id, user.id],
  );
  return !!enrollment.rowCount;
}

export function registerLearning(app: FastifyInstance, pool: Pool) {
  app.register(
    async (learning) => {
      learning.decorateRequest("learningUser", null);
      learning.addHook("onRequest", async (request, reply) => {
        const user = await currentUser(pool, request);
        if (!user) return reject(reply, 401, "Sign in to continue.");
        request.learningUser = user;
      });

      learning.get("/", async (request, reply) => {
        const { id, role } = request.learningUser!;
        if (role === "Instructor") {
          const { rows } = await pool.query(
            `
          SELECT ${details},
            (SELECT count(*)::int FROM lms.enrollments e JOIN lms.users student ON e.student_id = student.id
             WHERE e.course_id = c.id AND e.status = 'Active' AND student.status = 'Active') AS enrolled,
            (SELECT count(*)::int FROM lms.activities a
             WHERE a.course_id = c.id AND a.status = 'Active') AS activity_count,
            (SELECT count(*)::int FROM lms.submissions s
             LEFT JOIN lms.grades g ON g.activity_id = s.activity_id AND g.student_id = s.student_id
             WHERE s.course_id = c.id AND g.id IS NULL) AS review_count
          FROM lms.courses c JOIN lms.users u ON u.id = c.instructor_id
          WHERE c.instructor_id = $1 ORDER BY c.course_code`,
            [id],
          );
          return { courses: rows };
        }
        if (role !== "Student")
          return reject(reply, 403, "A student or instructor account is required.");
        return transaction(pool, async (db) => {
          await db.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY");
          const courses = await db.query(
            `SELECT ${details} ${studentCourses} ORDER BY c.course_code`,
            [id],
          );
          const activities = await db.query(
            `
          SELECT ${activityColumns}, ${submissionColumns}
          FROM lms.activities a
          LEFT JOIN lms.submissions s ON s.activity_id = a.id AND s.student_id = $1
          LEFT JOIN lms.grades g ON g.activity_id = s.activity_id AND g.student_id = s.student_id
          WHERE a.course_id IN (SELECT c.id ${studentCourses})
            AND (a.status = 'Active' OR s.id IS NOT NULL)
          ORDER BY a.due_date NULLS LAST, a.created_at, a.id`,
            [id],
          );
          return { courses: courses.rows, activities: activities.rows };
        });
      });

      learning.get<{ Params: CourseParams }>(
        "/courses/:id",
        { schema: { params: courseParams } },
        async (request, reply) => {
          const user = request.learningUser!;
          if (user.role === "Student") return reject(reply, 403, "Staff access is required.");
          const result = await transaction(pool, async (db) => {
            await db.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY");
            const id = request.params.id;
            const course = await db.query(
              `
          SELECT ${details} FROM lms.courses c JOIN lms.users u ON u.id = c.instructor_id
          WHERE c.id = $1 AND ($2 = 'Administrator' OR c.instructor_id = $3)`,
              [id, user.role, user.id],
            );
            if (!course.rowCount) return null;
            const roster = await db.query(
              `
          SELECT e.student_id, u.name AS student_name, e.enrollment_date, e.status,
                 u.status AS student_status
          FROM lms.enrollments e JOIN lms.users u ON u.id = e.student_id
          WHERE e.course_id = $1 ORDER BY lower(u.name), u.id`,
              [id],
            );
            const activities = await db.query(
              `
          SELECT ${activityColumns} FROM lms.activities a
          WHERE a.course_id = $1 ORDER BY a.due_date NULLS LAST, a.created_at, a.id`,
              [id],
            );
            const submissions = await db.query(
              `
          SELECT s.activity_id, ${submissionColumns}, grader.name AS graded_by
          FROM lms.submissions s LEFT JOIN lms.grades g ON g.activity_id = s.activity_id AND g.student_id = s.student_id
          LEFT JOIN lms.users grader ON grader.id = g.instructor_id
          WHERE s.course_id = $1 ORDER BY s.submitted_at, s.id`,
              [id],
            );
            return {
              course: course.rows[0],
              roster: roster.rows,
              activities: activities.rows,
              submissions: submissions.rows,
            };
          });
          return result ?? inaccessible(reply);
        },
      );

      learning.register(async (instructor) => {
        instructor.addHook("onRequest", async (request, reply) => {
          if (request.learningUser?.role !== "Instructor")
            return reject(reply, 403, "Instructor access is required.");
        });
        instructor.post<{ Params: CourseParams; Body: ActivityInput }>(
          "/courses/:id/activities",
          { schema: { params: courseParams, body: activityBody } },
          async (request, reply) =>
            saveActivity(pool, request.learningUser!, request.params.id, request.body, reply),
        );
        instructor.put<{ Params: ActivityParams; Body: ActivityInput }>(
          "/courses/:id/activities/:activityId",
          { schema: { params: activityParams, body: activityBody } },
          async (request, reply) =>
            saveActivity(
              pool,
              request.learningUser!,
              request.params.id,
              request.body,
              reply,
              request.params.activityId,
            ),
        );
        instructor.patch<{ Params: ActivityParams; Body: { status: "Active" | "Inactive" } }>(
          "/courses/:id/activities/:activityId",
          {
            schema: {
              params: activityParams,
              body: object({ status: { type: "string", enum: ["Active", "Inactive"] } }, [
                "status",
              ]),
            },
          },
          async (request, reply) => {
            const { id, activityId } = request.params;
            const changed = await transaction(pool, async (db) => {
              if (!(await availableCourse(db, id, request.learningUser!))) return false;
              const result = await db.query(
                "UPDATE lms.activities SET status = $1, updated_at = now() WHERE id = $2 AND course_id = $3",
                [request.body.status, activityId, id],
              );
              return !!result.rowCount;
            });
            return changed ? reply.code(204).send() : inaccessible(reply);
          },
        );
        instructor.put<{
          Params: ActivityParams & { submissionId: string };
          Body: { score: number; feedback: string };
        }>(
          "/courses/:id/activities/:activityId/submissions/:submissionId/grade",
          {
            schema: {
              params: gradeParams,
              body: object(
                {
                  score: { type: "number", minimum: 0, maximum: 99999.99 },
                  feedback: { type: "string", maxLength: 5000 },
                },
                ["score", "feedback"],
              ),
            },
          },
          async (request, reply) => {
            const { id, activityId, submissionId } = request.params;
            const { score, feedback } = request.body;
            const user = request.learningUser!;
            const result = await transaction(pool, async (db) => {
              if (!(await availableCourse(db, id, user))) return "missing";
              const activity = await db.query<{ max_points: number }>(
                "SELECT max_points::float8 FROM lms.activities WHERE id = $1 AND course_id = $2 FOR UPDATE",
                [activityId, id],
              );
              if (!activity.rows[0]) return "missing";
              const updated = await db.query<{ student_id: string }>(
                "SELECT student_id FROM lms.submissions WHERE id = $1 AND activity_id = $2 AND course_id = $3",
                [submissionId, activityId, id],
              );
              if (!updated.rows[0]) return "missing";
              if (score > activity.rows[0].max_points || score !== Number(score.toFixed(2)))
                return "score";
              await db.query(
                `
              INSERT INTO lms.grades (student_id, activity_id, instructor_id, grade, feedback)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (student_id, activity_id) DO UPDATE
              SET instructor_id = EXCLUDED.instructor_id, grade = EXCLUDED.grade,
                feedback = EXCLUDED.feedback, graded_at = clock_timestamp()`,
                [updated.rows[0].student_id, activityId, user.id, score, feedback.trim()],
              );
              await db.query("UPDATE lms.submissions SET status = 'Graded' WHERE id = $1", [
                submissionId,
              ]);
              return "saved";
            });
            if (result === "score")
              return reject(
                reply,
                422,
                "Enter a score from zero to the activity maximum, with up to two decimal places.",
              );
            return result === "saved" ? reply.code(204).send() : inaccessible(reply);
          },
        );
      });

      learning.post<{ Params: ActivityParams; Body: { response: string } }>(
        "/courses/:id/activities/:activityId/submit",
        {
          onRequest: async (request, reply) => {
            if (request.learningUser?.role !== "Student")
              return reject(reply, 403, "Student access is required.");
          },
          schema: {
            params: activityParams,
            body: object({ response: { type: "string", maxLength: 10000, pattern: "\\S" } }, [
              "response",
            ]),
          },
        },
        async (request, reply) => {
          const { id, activityId } = request.params;
          const user = request.learningUser!;
          const result = await transaction(pool, async (db) => {
            if (!(await availableCourse(db, id, user))) return "missing";
            const activity = await db.query(
              "SELECT 1 FROM lms.activities WHERE id = $1 AND course_id = $2 AND status = 'Active' FOR SHARE",
              [activityId, id],
            );
            if (!activity.rowCount) return "missing";
            const inserted = await db.query(
              `
            INSERT INTO lms.submissions (activity_id, course_id, student_id, submission_content, submitted_at)
            SELECT a.id, a.course_id, $3, $4, clock_timestamp() FROM lms.activities a
            WHERE a.id = $1 AND a.course_id = $2 AND (a.due_date IS NULL OR a.due_date > clock_timestamp())
            ON CONFLICT (activity_id, student_id) DO NOTHING RETURNING id`,
              [activityId, id, user.id, request.body.response.trim()],
            );
            if (inserted.rowCount) return inserted.rows[0];
            const existing = await db.query(
              "SELECT 1 FROM lms.submissions WHERE activity_id = $1 AND student_id = $2",
              [activityId, user.id],
            );
            return existing.rowCount ? "duplicate" : "late";
          });
          if (result === "missing") return inaccessible(reply);
          if (result === "late") return reject(reply, 422, "The activity deadline has passed.");
          if (result === "duplicate")
            return reject(reply, 409, "You already submitted this activity.");
          return reply.code(201).send(result);
        },
      );
    },
    { prefix: "/learning" },
  );
}

async function saveActivity(
  pool: Pool,
  user: User,
  courseId: string,
  input: ActivityInput,
  reply: FastifyReply,
  activityId?: string,
) {
  const due = new Date(input.due_date);
  if (!Number.isFinite(due.getTime()) || input.max_points !== Number(input.max_points.toFixed(2))) {
    return reject(
      reply,
      422,
      "Enter a valid deadline and maximum score with up to two decimal places.",
    );
  }
  const material = input.material_url?.trim();
  if (material) {
    const url = URL.parse(material);
    if (url?.protocol !== "https:" || url.username || url.password)
      return reject(reply, 422, "Enter an HTTPS link for learning materials.");
  }
  const fields = [
    input.title.trim(),
    input.description.trim(),
    due,
    input.max_points,
    material || null,
    courseId,
  ];
  const result = await transaction(pool, async (db) => {
    if (!(await availableCourse(db, courseId, user))) return "missing";
    if (!activityId) {
      const { rows } = await db.query(
        `
        INSERT INTO lms.activities (title, description, due_date, max_points, material_url, course_id)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        fields,
      );
      return rows[0];
    }
    const activity = await db.query(
      "SELECT 1 FROM lms.activities WHERE id = $1 AND course_id = $2 FOR UPDATE",
      [activityId, courseId],
    );
    if (!activity.rowCount) return "missing";
    const existing = await db.query(
      "SELECT 1 FROM lms.grades WHERE activity_id = $1 AND grade > $2 LIMIT 1",
      [activityId, input.max_points],
    );
    if (existing.rowCount) return "score";
    await db.query(
      `
      UPDATE lms.activities SET title = $1, description = $2, due_date = $3,
        max_points = $4, material_url = $5, updated_at = now()
      WHERE course_id = $6 AND id = $7`,
      [...fields, activityId],
    );
    return "saved";
  });
  if (result === "missing") return inaccessible(reply);
  if (result === "score")
    return reject(reply, 422, "The maximum score cannot be lower than a grade already awarded.");
  return result === "saved" ? reply.code(204).send() : reply.code(201).send(result);
}
