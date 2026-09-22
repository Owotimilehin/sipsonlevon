"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FaqItem } from "@/lib/faq";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Faq({
  items,
  defaultOpen = null,
}: {
  items: FaqItem[];
  /** Index to open on load. `null` starts fully collapsed. */
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const reduce = useReducedMotion();

  /* Deep links: /faq#returns-window opens that answer and scrolls to it.
     Deferred to after paint so the target element exists to scroll to, and
     so the open state is not set synchronously during the effect. */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const i = items.findIndex((x) => x.id === hash);
    if (i < 0) return;

    const frame = requestAnimationFrame(() => {
      setOpen(i);
      document.getElementById(hash)?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [items, reduce]);

  return (
    <ul className="border-t border-border">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <li key={item.id} id={item.id} className="border-b border-border scroll-mt-28">
            <button
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
              aria-controls={`${item.id}-answer`}
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
                  id={`${item.id}-answer`}
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
