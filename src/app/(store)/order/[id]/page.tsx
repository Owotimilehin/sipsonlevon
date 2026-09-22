import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db";
import { naira } from "@/lib/money";
import { opayConfigured } from "@/lib/opay";
import { settle } from "@/lib/settle";
import { FadeIn, Reveal } from "@/components/motion";
import { RetryPayment } from "./RetryPayment";

export const dynamic = "force-dynamic";

// Order pages are private receipts — never index them.
export const metadata = { title: "Your order", robots: { index: false, follow: false } };

const copy: Record<string, { label: string; note: string }> = {
  pending: { label: "Awaiting payment", note: "We hold the pieces until payment clears." },
  paid: { label: "Confirmed", note: "Payment received. The studio has your order." },
  processing: { label: "In the studio", note: "Being prepared for dispatch." },
  shipped: { label: "Shipped", note: "On its way to you." },
  delivered: { label: "Delivered", note: "Thank you." },
  cancelled: { label: "Cancelled", note: "This order was not completed." },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order = await getOrder(id);
  if (!order) notFound();

  /* The customer lands here straight from OPay's cashier, which may arrive
     before the callback does. Reconcile against OPay on view so the page is
     never stale, and never trust the redirect itself as proof of payment. */
  if (opayConfigured() && order.payment?.reference && order.status === "pending") {
    try {
      await settle(order.payment.reference);
      order = (await getOrder(id)) ?? order;
    } catch {
      // Status check failed; show the order as it stands rather than erroring.
    }
  }

  const state = copy[order.status] ?? copy.pending;
  const unpaid = order.status === "pending" || order.status === "cancelled";

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <FadeIn>
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">{state.label}</p>
        <h1 className="serif-display text-6xl mt-3">{order.id}</h1>
        <p className="mt-5 text-ink/70 leading-relaxed">
          Thank you, {order.customer.name}. {state.note}
        </p>
      </FadeIn>

      <Reveal delay={0.08}>
        <div className="gold-rule my-10" />
        <ul className="space-y-3 text-sm">
          {order.items.map((i) => (
            <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-6">
              <span>
                {i.name} · {i.size} × {i.qty}
              </span>
              <span className="tabular-nums">{naira(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 text-sm text-ink/60">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{naira(order.subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span className="tabular-nums">
              {order.shipping === 0 ? "Complimentary" : naira(order.shipping)}
            </span>
          </p>
        </div>
        <p className="mt-6 serif-display text-4xl tabular-nums">{naira(order.total)}</p>

        {order.payment ? (
          <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-ink/60">
            OPay · {order.payment.status}
          </p>
        ) : null}

        {unpaid && opayConfigured() ? <RetryPayment orderId={order.id} /> : null}

        <p className="mt-12 text-sm text-ink/60">
          Keep this number. Questions go to{" "}
          <Link href="/contact" className="rule-draw">
            the studio
          </Link>
          .
        </p>
      </Reveal>
    </div>
  );
}
