import { NextResponse } from "next/server";
import { deleteProduct, getProduct, saveProduct } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await getProduct(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const next = { ...existing, ...body, id: existing.id };
  await saveProduct(next);
  return NextResponse.json(next);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
