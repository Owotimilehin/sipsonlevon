import { getOrderByReference, restoreOrderStock, updateOrder } from "@/lib/db";
import { mapStatus, queryPaymentStatus } from "@/lib/opay";

/**
 * Reconciles one payment against OPay and writes the result to the order.
 *
 * The callback body is treated as untrusted: OPay publishes no webhook
 * signature scheme for the Cashier API, so nothing here believes the payload.
 * It reads only the reference, then asks OPay directly what happened.
 */
export async function settle(reference: string) {
  const order = await getOrderByReference(reference);
  if (!order) return { ok: false, reason: "unknown reference" as const };

  const remote = await queryPaymentStatus(reference);
  const mapped = mapStatus(remote.status);

  // Guard against a tampered or mismatched amount before marking anything paid.
  const expected = Math.round(order.total * 100);
  if (mapped.order === "paid" && remote.amount && remote.amount.total !== expected) {
    await updateOrder(order.id, {
      status: "pending",
      notes: `Payment amount mismatch: OPay reported ${remote.amount.total}, expected ${expected}`,
    });
    return { ok: false, reason: "amount mismatch" as const };
  }

  await updateOrder(order.id, {
    status: mapped.order,
    payment: {
      ...(order.payment ?? {
        provider: "opay" as const,
        reference,
        amount: order.total,
        currency: "NGN",
      }),
      provider: "opay" as const,
      reference,
      orderNo: remote.orderNo,
      status: mapped.payment,
      amount: order.total,
      currency: "NGN",
      updatedAt: new Date().toISOString(),
    },
  });

  if (mapped.payment === "failed" || mapped.payment === "closed") {
    await restoreOrderStock(order.id);
  }

  return { ok: true, orderId: order.id, status: mapped.order };
}
