import { readFileSync } from "node:fs";
import { createPool, loadDatabaseEnv, transaction } from "./database.js";

loadDatabaseEnv();
const pool = createPool();
try {
  await transaction(pool, async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(20261126, 1)");
    const { rows } = await db.query<{ schema: string; name: string }>(`
      SELECT n.nspname AS schema, c.relname AS name
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
        AND n.nspname NOT IN ('information_schema', 'auth', 'extensions', 'storage',
                              'realtime', 'vault', 'supabase_migrations', 'net')
        AND n.nspname !~ '^pg_'
      ORDER BY 1, 2
    `);
    console.log(
      "Existing application relations:",
      rows.map(({ schema, name }) => `${schema}.${name}`).join(", ") || "none",
    );
    const hasLedger = rows.some(
      ({ schema, name }) => schema === "lms" && name === "schema_migrations",
    );
    const applied = hasLedger
      ? new Set(
          (
            await db.query<{ version: string }>("SELECT version FROM lms.schema_migrations")
          ).rows.map(({ version }) => version),
        )
      : new Set<string>();
    const tables = ["users", "courses", "enrollments", "activities", "submissions", "grades"];
    if (
      !applied.has("001_lms") &&
      rows.some(({ schema, name }) => schema === "lms" || tables.includes(name.toLowerCase()))
    ) {
      throw new Error("Review the existing application relations before applying this migration.");
    }
    if (!applied.has("001_lms")) {
      const managedAuth = await db.query("SELECT to_regclass('auth.users') AS relation");
      if (managedAuth.rows[0].relation) {
        const registered = await db.query("SELECT 1 FROM auth.users LIMIT 1");
        if (registered.rowCount)
          throw new Error("Review existing Supabase Auth accounts before creating LMS accounts.");
      }
    }
    for (const version of ["001_lms", "002_learning"]) {
      if (applied.has(version)) {
        console.log(`Migration ${version} already applied.`);
        continue;
      }
      await db.query(
        readFileSync(new URL(`../migrations/${version}.sql`, import.meta.url), "utf8"),
      );
      console.log(`Applied migration ${version}.`);
    }
  });
} finally {
  await pool.end();
}
