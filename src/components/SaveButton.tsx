"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const KEY = "sl_saved";
const EVENT = "sl-saved";

export function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeSaved(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

/** Heart toggle. Mirrors the bag's localStorage contract exactly. */
export function SaveButton({
  productId,
  name,
  className = "",
  floating = false,
}: {
  productId: string;
  name: string;
  className?: string;
  floating?: boolean;
}) {
  const [on, setOn] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const read = () => setOn(readSaved().includes(productId));
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [productId]);

  function toggle(e: React.MouseEvent) {
    // The card is wrapped in a Link; saving must not navigate.
    e.preventDefault();
    e.stopPropagation();
    const ids = readSaved();
    writeSaved(ids.includes(productId) ? ids.filter((x) => x !== productId) : [...ids, productId]);
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
      whileTap={reduce ? undefined : { scale: 0.85 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      className={`${
        floating
          ? "absolute top-2 right-2 z-10 grid h-11 w-11 place-items-center bg-paper/85 backdrop-blur-sm"
          : "grid h-11 w-11 -m-2 place-items-center"
      } transition-colors ${on ? "text-accent-ink" : "text-ink/60 hover:text-ink"} ${className}`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 20 18"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <path d="M10 16.5S1.5 11.6 1.5 5.9A4.4 4.4 0 0 1 10 4.2a4.4 4.4 0 0 1 8.5 1.7c0 5.7-8.5 10.6-8.5 10.6Z" />
      </svg>
    </motion.button>
  );
}
