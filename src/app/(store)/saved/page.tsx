"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { naira } from "@/lib/money";
import { readSaved, writeSaved } from "@/components/SaveButton";
import type { Product } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function SavedPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    async function load() {
      const ids = readSaved();
      const products: Product[] = await fetch("/api/products").then((r) => r.json());
      // Keep the saved order, and drop anything unpublished or deleted.
      setItems(ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[]);
      setReady(true);
    }
    load();
    window.addEventListener("sl-saved", load);
    return () => window.removeEventListener("sl-saved", load);
  }, []);

  function remove(id: string) {
    writeSaved(readSaved().filter((x) => x !== id));
    setItems((xs) => xs.filter((p) => p.id !== id));
  }

  if (!ready) {
    return <div className="px-6 py-24 text-sm text-ink/60">Opening your list…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-16">
      <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Private</p>
      <h1 className="serif-display text-6xl md:text-7xl mt-3">Saved</h1>

      {items.length === 0 ? (
        <p className="mt-10 text-ink/60">
          Nothing saved yet.{" "}
          <Link href="/shop" className="rule-draw">
            Go to the shop
          </Link>
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-ink/60">
            {items.length} {items.length === 1 ? "piece" : "pieces"}. Saved to this browser
            only.
          </p>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((p) => {
                const sold = Object.values(p.stock).every((n) => n < 1);
                return (
                  <motion.li
                    key={p.id}
                    layout={!reduce}
                    initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                    transition={{ duration: reduce ? 0.15 : 0.32, ease: EASE }}
                  >
                    <Link href={`/product/${p.slug}`} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                        <img
                          src={p.images[0]}
                          alt={p.name} loading="lazy" decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 ease-(--ease-expo) group-hover:scale-[1.04]"
                        />
                        {sold ? (
                          <span className="absolute top-3 left-3 bg-paper/90 px-2 py-1 text-[10px] tracking-[0.2em] uppercase">
                            Sold through
                          </span>
                        ) : null}
                      </div>
                      <h2 className="serif text-2xl mt-4">{p.name}</h2>
                      <p className="mt-1 text-sm tabular-nums">{naira(p.price)}</p>
                    </Link>
                    <button
                      onClick={() => remove(p.id)}
                      className="mt-3 text-[10px] tracking-[0.22em] uppercase text-ink/60 hover:text-ink transition-colors"
                    >
                      Remove
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </>
      )}
    </div>
  );
}
