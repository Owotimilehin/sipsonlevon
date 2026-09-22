"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { naira } from "@/lib/money";

type Line = {
  productId: string;
  size: string;
  qty: number;
  name?: string;
  price?: number;
  image?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    async function load() {
      const raw = localStorage.getItem("sl_cart");
      const cart = raw ? (JSON.parse(raw) as Line[]) : [];
      const res = await fetch("/api/products");
      const products = await res.json();
      setLines(
        cart.map((c) => {
          const p = products.find((x: { id: string }) => x.id === c.productId);
          return { ...c, name: p?.name, price: p?.price, image: p?.images?.[0] };
        })
      );
      setReady(true);
    }
    load();
  }, []);

  function persist(next: Line[]) {
    const slim = next.map(({ productId, size, qty }) => ({ productId, size, qty }));
    localStorage.setItem("sl_cart", JSON.stringify(slim));
    window.dispatchEvent(new Event("sl-cart"));
    setLines(next);
  }

  const subtotal = lines.reduce((a, l) => a + (l.price || 0) * l.qty, 0);

  if (!ready) return <div className="px-6 py-24 text-sm text-ink/60">Opening the bag…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="serif-display text-6xl md:text-7xl">Your bag</h1>
      {lines.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-10 text-ink/60"
        >
          Empty.{" "}
          <Link href="/shop" className="rule-draw">
            Return to the shop
          </Link>
        </motion.p>
      ) : (
        <>
          <ul className="mt-12 divide-y divide-border">
            {/* popLayout lets the remaining lines slide up into the gap a
                removed line leaves behind — the Continuity job. */}
            <AnimatePresence mode="popLayout" initial={false}>
              {lines.map((l, idx) => (
                <motion.li
                  key={`${l.productId}-${l.size}`}
                  layout={!reduce}
                  initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: reduce ? 0 : -24 }}
                  transition={{ duration: reduce ? 0.15 : 0.32, ease: EASE }}
                  className="py-6 flex gap-5"
                >
                  {l.image ? (
                    <div className="h-28 w-20 shrink-0 overflow-hidden bg-sand">
                      <img src={l.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <p className="serif text-2xl">{l.name}</p>
                    <p className="text-xs tracking-[0.18em] uppercase text-ink/60 mt-1">
                      Size {l.size}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center border border-border">
                        <button
                          aria-label={`Decrease quantity of ${l.name}`}
                          className="grid h-11 w-11 place-items-center transition-opacity hover:opacity-50"
                          onClick={() =>
                            persist(
                              lines.map((x, i) =>
                                i === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x
                              )
                            )
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center tabular-nums">{l.qty}</span>
                        <button
                          aria-label={`Increase quantity of ${l.name}`}
                          className="grid h-11 w-11 place-items-center transition-opacity hover:opacity-50"
                          onClick={() =>
                            persist(
                              lines.map((x, i) => (i === idx ? { ...x, qty: x.qty + 1 } : x))
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-ink/60 hover:text-ink transition-colors text-xs tracking-[0.18em] uppercase"
                        onClick={() => persist(lines.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm tabular-nums">{naira((l.price || 0) * l.qty)}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <motion.div layout={!reduce} className="mt-10 flex items-center justify-between">
            <p className="text-sm text-ink/60">Subtotal</p>
            <p className="serif-display text-4xl tabular-nums">{naira(subtotal)}</p>
          </motion.div>
          <motion.div layout={!reduce}>
            <Link
              href="/checkout"
              className="mt-8 inline-block bg-ink text-paper px-10 py-3.5 text-[11px] tracking-[0.28em] uppercase transition-colors hover:bg-ink/85"
            >
              Checkout
            </Link>
          </motion.div>
        </>
      )}
    </div>
  );
}
