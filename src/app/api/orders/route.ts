import { NextResponse } from "next/server";
import { createOrder, getProduct, listOrders, nextOrderId } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSessionUser } from "@/lib/account";
import { opayConfigured } from "@/lib/opay";
import type { Order, OrderItem } from "@/lib/types";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listOrders());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawItems = body.items as { productId: string; size: string; qty: number }[];
    const items: OrderItem[] = [];
    let subtotal = 0;
    for (const line of rawItems) {
      const p = await getProduct(line.productId);
      if (!p) return NextResponse.json({ error: "Unknown product" }, { status: 400 });
      items.push({
        productId: p.id,
        name: p.name,
        size: line.size,
        qty: Number(line.qty),
        price: p.price,
      });
      subtotal += p.price * Number(line.qty);
    }
    const shipping = subtotal >= 250000 ? 0 : 8500;

    // Guests stay guests — the session is read, never required (PRD §14).
    const user = await getSessionUser();

    /* With a processor wired up an order is not paid until OPay says so.
       Without keys configured the house falls back to v1's manual mark,
       so local development and the acceptance walk still work. */
    const takesPayment = opayConfigured();

    const order: Order = {
      id: await nextOrderId(),
      createdAt: new Date().toISOString(),
      status: takesPayment ? "pending" : "paid",
      userId: user?.id,
      customer: body.customer,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
    await createOrder(order);
    return NextResponse.json({ ...order, requiresPayment: takesPayment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
