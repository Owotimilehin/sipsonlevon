"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useRef } from "react";

/* Curves and durations mirror the tokens in globals.css.
   Values derived from the motion-vocabulary translation table:
   "editorial / expensive" -> 900ms, expo-out, 90ms stagger. */
const EXPO = [0.16, 1, 0.3, 1] as const;
const EDITORIAL = 0.9;
const VIEWPORT = { once: true, margin: "-10% 0px" } as const;

/** Scroll reveal: rise + fade, fires once, slightly early. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration: reduce ? 0.2 : EDITORIAL,
        delay: reduce ? 0 : delay,
        ease: EXPO,
      }}
    >
      {children}
    </Tag>
  );
}

/** Grid/list parent. Stagger math: min(90ms, 600ms / count). */
export function Stagger({
  children,
  count = 4,
  className,
}: {
  children: React.ReactNode;
  count?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const step = Math.min(0.09, 0.6 / Math.max(count, 1));
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : step } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.7, ease: EXPO },
    },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/**
 * Headline whose lines wipe up from behind a mask.
 * Pass lines as an array so each gets its own overflow-hidden track.
 */
export function SplitLines({
  lines,
  className,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={line + i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: reduce ? 0 : "108%", opacity: reduce ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: reduce ? 0.25 : EDITORIAL,
              delay: reduce ? 0 : delay + i * 0.09,
              ease: EXPO,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Scroll-linked parallax. Travel stays small; zero when reduced. */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-distance / 2, distance / 2]
  );
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Fade in on mount. For content that sits above the fold. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.6, delay, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}
