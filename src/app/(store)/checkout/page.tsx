"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { naira } from "@/lib/money";

type Me = { id: string; name: string; email: string } | null;
type Line = {
  productId: string;
  size: string;
  qty: number;
  name: string;
  price: number;
  image?: string;
};

const field =
  "w-full border border-border-strong bg-transparent px-4 py-3 text-base sm:text-sm outline-none " +
  "transition-colors duration-(--dur-base) focus:border-ink";

export default function CheckoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem("sl_cart");
      const cart = raw ? JSON.parse(raw) : [];
      const [products, account] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/account")
          .then((r) => r.json())
          .catch(() => ({ user: null })),
      ]);
      // Names and prices come from the catalogue, never from the browser.
      const resolved: Line[] = cart
        .map((c: { productId: string; size: string; qty: number }) => {
          const p = products.find((x: { id: string }) => x.id === c.productId);
          return p ? { ...c, name: p.name, price: p.price, image: p.images?.[0] } : null;
        })
        .filter(Boolean) as Line[];
      setLines(resolved);
      setSubtotal(resolved.reduce((a, l) => a + l.price * l.qty, 0));
      setMe(account?.user ?? null);
      setReady(true);
    }
    load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    const raw = localStorage.getItem("sl_cart");
    const items = raw ? JSON.parse(raw) : [];
    if (!items.length) {
      setStatus("Bag is empty.");
      return;
    }

    setBusy(true);
    setStatus("Placing order…");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          address: fd.get("address"),
          city: fd.get("city"),
          country: fd.get("country") || "Nigeria",
        },
        items,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(data.error || "Could not place order");
      return;
    }

    // The bag is only cleared once the order exists on the server.
    localStorage.removeItem("sl_cart");
    window.dispatchEvent(new Event("sl-cart"));

    if (data.requiresPayment) {
      setStatus("Opening secure payment…");
      const pay = await fetch("/api/payments/opay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.id }),
      });
      const payData = await pay.json();
      if (pay.ok && payData.cashierUrl) {
        window.location.href = payData.cashierUrl;
        return;
      }
      // Payment could not start: the order still exists and is pending.
      router.push(`/order/${data.id}?pay=failed`);
      return;
    }

    router.push(`/order/${data.id}`);
  }

  const shipping = subtotal >= 250000 || subtotal === 0 ? 0 : 8500;
  const empty = ready && lines.length === 0;

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="serif-display text-5xl sm:text-6xl">Checkout</h1>

      {/* The customer can see exactly what they are paying for, at the moment
          they are asked to pay for it. */}
      <section aria-label="Order summary" className="mt-10 border-y border-border py-6">
        {!ready ? (
          <p className="text-sm text-ink/60">Reading your bag…</p>
        ) : empty ? (
          <p className="text-sm text-ink/60">
            Your bag is empty.{" "}
            <Link href="/shop" className="rule-draw">
              Go to the shop
            </Link>
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={l.productId + l.size} className="flex items-center gap-4">
                  {l.image ? (
                    <div className="h-16 w-12 shrink-0 overflow-hidden bg-sand">
                      <img
                        src={l.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="serif text-lg truncate">{l.name}</p>
                    <p className="text-[10px] tracking-[0.18em] uppercase text-ink/60">
                      Size {l.size} · {l.qty}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{naira(l.price * l.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-ink/60">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{naira(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink/60">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {shipping === 0 ? "Complimentary" : naira(shipping)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between pt-3">
                <dt className="text-[11px] tracking-[0.22em] uppercase">Total</dt>
                <dd className="serif text-3xl tabular-nums">{naira(subtotal + shipping)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      {!me && !empty && (
        <p className="mt-6 text-sm text-ink/60">
          Checking out as a guest.{" "}
          <Link href="/account/login?next=/checkout" className="rule-draw">
            Sign in
          </Link>{" "}
          to keep this order in your history.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <input
          name="name"
          required
          defaultValue={me?.name ?? ""}
          autoComplete="name"
          placeholder="Name"
          aria-label="Name"
          className={field}
        />
        <input
          name="email"
          type="email"
          required
          defaultValue={me?.email ?? ""}
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          className={field}
        />
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="Phone"
          aria-label="Phone"
          className={field}
        />
        <input
          name="address"
          required
          autoComplete="street-address"
          placeholder="Address"
          aria-label="Address"
          className={field}
        />
        <input
          name="city"
          required
          autoComplete="address-level2"
          placeholder="City"
          aria-label="City"
          className={field}
        />
        <input
          name="country"
          defaultValue="Nigeria"
          autoComplete="country-name"
          aria-label="Country"
          className={field}
        />
        <motion.button
          disabled={busy || empty}
          whileTap={reduce || busy ? undefined : { scale: 0.99 }}
          className="w-full bg-ink text-paper py-3.5 text-[11px] tracking-[0.28em] uppercase transition-colors hover:bg-ink/85 disabled:opacity-50"
        >
          {busy ? "Working…" : "Place order"}
        </motion.button>
        {status ? (
          <p role="status" className="text-sm text-ink/70">
            {status}
          </p>
        ) : null}
        <p className="text-[11px] leading-relaxed text-ink/60">
          Payment is taken by OPay on a secure page. The house never sees your card.
        </p>
      </form>
    </div>
  );
}
