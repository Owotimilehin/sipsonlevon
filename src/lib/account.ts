import { cookies } from "next/headers";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getUserById } from "./db";
import type { User } from "./types";

const COOKIE = "sl_user";
function accountSecret() {
  const value = process.env.ACCOUNT_SECRET;
  if (!value) {
    throw new Error(
      "ACCOUNT_SECRET is not set. Generate one with: " +
        "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return value;
}
const scryptAsync = promisify(scrypt) as (
  pw: string,
  salt: string,
  len: number
) => Promise<Buffer>;

/* Passwords are stored as scrypt(salt:hash). Node's crypto is used rather
   than bcrypt so v1 adds no native dependency. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const key = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== key.length) return false;
  return timingSafeEqual(key, expected);
}

function sign(userId: string) {
  return createHmac("sha256", accountSecret()).update(userId).digest("hex");
}

/** Cookie value is `<id>.<hmac>` so a tampered id fails verification. */
function readToken(token: string | undefined) {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 1) return null;
  const id = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(id);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return id;
}

export async function setUserSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** The signed-in customer, or null. Never throws — guest is a valid state. */
export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const id = readToken(jar.get(COOKIE)?.value);
  if (!id) return null;
  return (await getUserById(id)) ?? null;
}

/** Shape safe to send to the browser: never includes passwordHash. */
export function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export type PublicUser = ReturnType<typeof publicUser>;
