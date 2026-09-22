import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import { listOrdersForUser } from "@/lib/db";
import { naira } from "@/lib/money";
import { FadeIn, Reveal } from "@/components/motion";
import { SignOut } from "./SignOut";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your account" };

const statusLabel: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Confirmed",
  processing: "In the studio",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login?next=/account");

  const orders = await listOrdersForUser(user.id, user.email);

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-16 md:py-20">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Your account</p>
            <h1 className="serif-display text-5xl md:text-6xl mt-3">{user.name}</h1>
            <p className="mt-3 text-sm text-ink/60">{user.email}</p>
          </div>
          <SignOut />
        </div>
      </FadeIn>

      <Reveal delay={0.08}>
        <div className="gold-rule my-12" />
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="serif text-3xl">Order history</h2>
          <Link href="/saved" className="rule-draw text-[11px] tracking-[0.22em] uppercase">
            Saved pieces
          </Link>
        </div>
      </Reveal>

      {orders.length === 0 ? (
        <Reveal delay={0.12}>
          <p className="mt-8 text-ink/60">
            No orders yet.{" "}
            <Link href="/shop" className="rule-draw">
              Go to the shop
            </Link>
          </p>
        </Reveal>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {orders.map((o, i) => (
            <Reveal as="li" key={o.id} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/order/${o.id}`}
                className="group flex flex-wrap items-center justify-between gap-4 py-6"
              >
                <div>
                  <p className="serif text-2xl">
                    <span className="rule-draw inline-block">{o.id}</span>
                  </p>
                  <p className="mt-1 text-[11px] tracking-[0.18em] uppercase text-ink/60">
                    {new Date(o.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {o.items.reduce((a, b) => a + b.qty, 0)} pieces
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{naira(o.total)}</p>
                  <p className="mt-1 text-[11px] tracking-[0.18em] uppercase text-ink/60">
                    {statusLabel[o.status] ?? o.status}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
