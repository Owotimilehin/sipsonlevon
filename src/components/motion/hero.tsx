"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Hero frame with scroll-linked motion.
 *
 * The image drifts (CSS ken-burns, always running) and the whole frame
 * parallaxes against the scroll while the content above it lifts and fades.
 * Everything here is transform/opacity only — the <img> inside stays an
 * ordinary eager image so it remains the LCP element.
 */
export function HeroFrame({
  image,
  children,
  className = "",
}: {
  image: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The image trails the scroll; the copy leaves a little faster than the frame.
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "22%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], reduce ? [1, 1] : [1, 0]);
  const scrim = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);

  return (
    <section ref={ref} className={`relative flex overflow-hidden ${className}`}>
      <motion.div style={{ y: imageY }} className="absolute inset-0 h-[118%] -top-[9%]">
        {image}
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ opacity: scrim }}
        className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5"
      />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-5 md:px-8 pb-16 md:pb-24 text-white"
      >
        {children}
      </motion.div>
    </section>
  );
}

/** Hairline scroll cue. Hidden from reduced-motion users and screen readers. */
export function ScrollCue({ label = "Scroll" }: { label?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-white/70 md:flex">
      <span className="text-[9px] tracking-[0.34em] uppercase">{label}</span>
      <span className="cue relative h-10 w-px bg-white/20 text-white/70" aria-hidden="true" />
    </div>
  );
}
