import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { publicUser, setUserSession, verifyPassword } from "@/lib/account";

/* Small in-process throttle. Enough to blunt credential stuffing in v1;
   a real limiter belongs with the Postgres move. */
const attempts = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX = 8;

function throttled(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.until) return false;
  return rec.n >= MAX;
}

function record(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.until) attempts.set(key, { n: 1, until: now + WINDOW });
  else rec.n += 1;
}

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const key = (email ?? "").trim().toLowerCase();

  if (throttled(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const user = await getUserByEmail(key);
  // Same message either way, so the endpoint does not confirm which emails exist.
  const bad = NextResponse.json({ error: "Email or password is wrong" }, { status: 401 });

  if (!user) {
    record(key);
    return bad;
  }
  if (!(await verifyPassword(password ?? "", user.passwordHash))) {
    record(key);
    return bad;
  }

  attempts.delete(key);
  await setUserSession(user.id);
  return NextResponse.json({ user: publicUser(user) });
}
