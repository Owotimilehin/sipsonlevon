import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/account";

/** Who is signed in. Returns `{ user: null }` for guests, never a 401,
 *  so the storefront can call it on any page without error handling. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
