"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/types";
import { SaveButton } from "@/components/SaveButton";

export function AddToBag({ product }: { product: Product }) {
  const available = product.sizes.filter((s) => (product.stock[s] ?? 0) > 0);
  const [size, setSize] = useState(available[0] || product.sizes[0]);
  const [msg, setMsg] = useState("");
  const reduce = useReducedMotion();

  function add() {
    const raw = localStorage.getItem("sl_cart");
    const cart = raw ? (JSON.parse(raw) as { productId: string; size: string; qty: number }[]) : [];
    const i = cart.findIndex((x) => x.productId === product.id && x.size === size);
    if (i >= 0) cart[i].qty += 1;
    else cart.push({ productId: product.id, size, qty: 1 });
    localStorage.setItem("sl_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("sl-cart"));
    setMsg(`Added ${product.name} · ${size}`);
  }

  const left = product.stock[size] ?? 0;

  return (
    <div className="mt-8">
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink/60">Size</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.sizes.map((s) => {
          const n = product.stock[s] ?? 0;
          const on = size === s;
          return (
            <motion.button
              key={s}
              disabled={n < 1}
              onClick={() => setSize(s)}
              aria-pressed={on}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid h-11 min-w-12 place-items-center border border-border-strong px-3 text-xs disabled:line-through disabled:opacity-30"
            >
              {/* Shared layoutId slides the ink fill between sizes instead of
                  cutting — the Continuity job. */}
              {on && (
                <motion.span
                  layoutId="size-fill"
                  className="absolute inset-0 bg-ink"
                  transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className={`relative z-10 ${on ? "text-paper" : ""}`}>{s}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink/60">
        {left > 0 ? `${left} available` : "Sold through"}
      </p>
      <motion.button
        onClick={add}
        disabled={left < 1}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 w-full md:w-auto px-10 py-3.5 bg-ink text-paper text-[11px] tracking-[0.28em] uppercase transition-colors hover:bg-ink/85 disabled:opacity-40 disabled:pointer-events-none"
      >
        Add to bag
      </motion.button>
      <div className="mt-5 flex items-center gap-2.5 text-[10px] tracking-[0.22em] uppercase text-ink/60">
        <SaveButton productId={product.id} name={product.name} />
        <span>Save this piece</span>
      </div>
      <AnimatePresence mode="wait">
        {msg ? (
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -4 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="mt-4 text-sm text-ink/70"
          >
            {msg}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
