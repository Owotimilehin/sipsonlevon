import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/account";

export async function POST() {
  await clearUserSession();
  return NextResponse.json({ ok: true });
}
