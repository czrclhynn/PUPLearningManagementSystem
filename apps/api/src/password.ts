import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);

export function validPassword(password: string) {
  return password.length >= 12 && password.length <= 128;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await derive(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string | undefined) {
  const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(storedHash ?? "");
  const key = (await derive(password, match?.[1] ?? "0".repeat(32), 64)) as Buffer;
  return timingSafeEqual(key, Buffer.from(match?.[2] ?? "0".repeat(128), "hex")) && !!match;
}
