import { createPool, loadDatabaseEnv, transaction } from "./database.js";
import { hashPassword, validPassword } from "./password.js";

loadDatabaseEnv();
const name = process.env.LMS_ADMIN_NAME?.trim();
const email = process.env.LMS_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.LMS_ADMIN_PASSWORD;
if (
  !name ||
  name.length > 120 ||
  !email ||
  email.length > 254 ||
  !/^\S+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !password ||
  !validPassword(password)
) {
  throw new Error(
    "Set LMS_ADMIN_NAME, LMS_ADMIN_EMAIL and LMS_ADMIN_PASSWORD (12–128 characters).",
  );
}

const pool = createPool();
try {
  await transaction(pool, async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(20261126, 2)");
    const existing = await db.query("SELECT 1 FROM lms.users WHERE role = 'Administrator' LIMIT 1");
    if (existing.rowCount) throw new Error("An administrator account already exists.");
    await db.query(
      "INSERT INTO lms.users (name, email, password_hash, role) VALUES ($1, $2, $3, 'Administrator')",
      [name, email, await hashPassword(password)],
    );
  });
  console.log("Initial administrator created.");
} finally {
  await pool.end();
}
