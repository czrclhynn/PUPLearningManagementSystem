import { createApp } from "./app.js";
import { readConfig } from "./config.js";
import { createPool, loadDatabaseEnv } from "./database.js";

loadDatabaseEnv();
const pool = createPool();
const app = createApp(
  pool,
  process.env.SESSION_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
);
app.addHook("onClose", async () => pool.end());
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => void app.close());
}

try {
  console.log(`LMS API listening at ${await app.listen(readConfig())}`);
} catch (error) {
  console.error("Could not start the LMS API.", (error as NodeJS.ErrnoException).code ?? "");
  await app.close();
  process.exitCode = 1;
}
