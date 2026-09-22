"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

/** Route fade-through. Exit is ~60% of enter (motion-vocabulary, law 2). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={path}
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: reduce ? 0.1 : 0.32,
          ease: [0.77, 0, 0.175, 1],
        }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
