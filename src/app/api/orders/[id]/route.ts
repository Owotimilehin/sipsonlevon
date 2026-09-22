import { NextResponse } from "next/server";
import { getOrder, restoreOrderStock, updateOrder } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const before = await getOrder(id);
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await updateOrder(id, body);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  /* Cancelling by hand returns units to the rail, exactly as a failed payment
     does. Guarded by stockRestored so it cannot double-credit. */
  if (before.status !== "cancelled" && order.status === "cancelled") {
    await restoreOrderStock(id);
    return NextResponse.json((await getOrder(id)) ?? order);
  }

  return NextResponse.json(order);
}
