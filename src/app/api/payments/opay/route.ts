import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/db";
import { createCashierPayment, opayConfigured } from "@/lib/opay";

function siteUrl(req: Request) {
  return process.env.SITE_URL || new URL(req.url).origin;
}

/** Hands an existing order to OPay and returns the hosted cashier URL. */
export async function POST(req: Request) {
  try {
    if (!opayConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured on this server" },
        { status: 503 }
      );
    }

    const { orderId } = await req.json();
    const order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    if (order.status === "paid") {
      return NextResponse.json({ error: "That order is already paid" }, { status: 409 });
    }

    const origin = siteUrl(req);
    // Reference must be unique per attempt, or OPay rejects the retry.
    const reference = `${order.id}-${Date.now().toString(36)}`;

    const result = await createCashierPayment({
      reference,
      amountNaira: order.total,
      returnUrl: `${origin}/order/${order.id}`,
      callbackUrl: `${origin}/api/payments/opay/callback`,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        description: `Size ${i.size}`,
        price: i.price,
        quantity: i.qty,
      })),
    });

    await updateOrder(order.id, {
      payment: {
        provider: "opay",
        reference,
        orderNo: result.orderNo,
        status: "initial",
        amount: order.total,
        currency: "NGN",
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ cashierUrl: result.cashierUrl, reference });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start payment";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
