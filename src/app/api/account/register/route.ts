import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { hashPassword, publicUser, setUserSession } from "@/lib/account";
import { uid } from "@/lib/money";
import type { User } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "")) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user: User = {
      id: uid("u"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await createUser(user);
    await setUserSession(user.id);
    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create the account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
