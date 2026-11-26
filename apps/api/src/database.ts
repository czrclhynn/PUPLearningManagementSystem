import { readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import pg from "pg";

export const rootEnv = new URL("../../../.env", import.meta.url);

export function loadDatabaseEnv() {
  try {
    loadEnvFile(rootEnv);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export function createPool(env = process.env) {
  const { DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_SSLMODE = "require" } = env;
  const port = Number(env.DB_PORT ?? 5432);
  if (!DB_HOST || !DB_DATABASE || !DB_USERNAME || !DB_PASSWORD) {
    throw new Error("Set DB_HOST, DB_DATABASE, DB_USERNAME, and DB_PASSWORD.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid DB_PORT.");
  const loopback = ["127.0.0.1", "::1", "localhost"].includes(DB_HOST);
  if (!["require", "verify-full"].includes(DB_SSLMODE) && !(loopback && DB_SSLMODE === "disable")) {
    throw new Error("Use DB_SSLMODE=require or verify-full for a remote database.");
  }
  const pool = new pg.Pool({
    host: DB_HOST,
    port,
    database: DB_DATABASE,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    ssl:
      DB_SSLMODE === "disable"
        ? false
        : {
            rejectUnauthorized: DB_SSLMODE === "verify-full",
            ca: env.DB_SSLROOTCERT ? readFileSync(env.DB_SSLROOTCERT, "utf8") : undefined,
          },
    max: 5,
    connectionTimeoutMillis: 6000,
    statement_timeout: 10000,
  });
  pool.on("error", (error: NodeJS.ErrnoException) => {
    console.error("Database pool connection lost", error.code ?? "unknown");
  });
  return pool;
}

export async function transaction<T>(pool: pg.Pool, work: (client: pg.PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
