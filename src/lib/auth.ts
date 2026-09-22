import { cookies } from "next/headers";

const COOKIE = "sl_admin";

/**
 * Staff credentials come from the environment, with no fallback on purpose.
 * A hardcoded default means every copy of this repo shares a known password,
 * and any deploy that forgets to set one is wide open.
 */
function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and set it. ` +
        `Quote any value containing "#", or dotenv truncates it there.`
    );
  }
  return value;
}

export function adminPassword() {
  return required("ADMIN_PASSWORD");
}

function adminToken() {
  return required("ADMIN_TOKEN");
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === adminToken();
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
