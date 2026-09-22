import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { adminPassword, setAdminSession } from "@/lib/auth";

/* The staff door gets the same throttle as the customer one — tighter, since
   there is only ever one password behind it. Keyed by IP, so one attacker
   cannot lock every operator out by hammering a shared account name. */
const attempts = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX = 5;

function clientKey(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

function throttled(key: string) {
  const rec = attempts.get(key);
  return Boolean(rec && Date.now() <= rec.until && rec.n >= MAX);
}

function record(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now > rec.until) attempts.set(key, { n: 1, until: now + WINDOW });
  else rec.n += 1;
}

function sameSecret(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  const key = clientKey(req);
  if (throttled(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const { password } = await req.json();
  if (typeof password !== "string" || !sameSecret(password, adminPassword())) {
    record(key);
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  attempts.delete(key);
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
