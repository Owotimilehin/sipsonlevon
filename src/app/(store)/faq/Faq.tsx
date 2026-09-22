"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <ul className="border-t border-border">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <li key={item.q} className="border-b border-border">
            <button
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="serif text-xl md:text-2xl">{item.q}</span>
              {/* Rotation, not a swapped glyph, so the state change is legible. */}
              <motion.span
                animate={{ rotate: on ? 45 : 0 }}
                transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
                className="shrink-0 text-xl leading-none text-ink/60"
                aria-hidden="true"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0.1 : 0.32, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-10 text-[15px] leading-relaxed text-ink/70">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
