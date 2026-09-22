"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type Check = { label: string; value: string; ok: boolean | null };

export function MotionCheck() {
  const reduce = useReducedMotion();
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    // After paint: computed animation values are not final before it.
    const frame = requestAnimationFrame(() => {
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Read what the browser actually computed for the hero's animation.
    const probe = document.getElementById("drift-probe");
    const cs = probe ? getComputedStyle(probe) : null;
    const animName = cs?.animationName ?? "none";
    const animDur = cs?.animationDuration ?? "0s";

    const t = document.getElementById("transition-probe");
    const tDur = t ? getComputedStyle(t).transitionDuration : "0s";

    setChecks([
      {
        label: "JavaScript hydrated",
        value: "yes",
        ok: true,
      },
      {
        label: "OS / browser asks for reduced motion",
        value: prefersReduce ? "YES — motion is being suppressed" : "no",
        ok: !prefersReduce,
      },
      {
        label: "Motion library sees reduced motion",
        value: reduce ? "yes" : "no",
        ok: !reduce,
      },
      {
        label: "Hero ken-burns animation-name",
        value: animName,
        ok: animName.includes("ken-burns"),
      },
      {
        label: "Hero ken-burns duration",
        value: animDur,
        ok: parseFloat(animDur) > 1,
      },
      {
        label: "CSS transition duration",
        value: tDur,
        ok: parseFloat(tDur) > 0.05,
      },
    ]);
    });
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  const blocked = checks.some((c) => c.label.startsWith("OS") && c.ok === false);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="serif-display text-5xl">Motion check</h1>
      <p className="mt-4 text-sm text-ink/60">
        What this browser is actually doing, read from computed styles.
      </p>

      {/* Probes the effect reads from. */}
      <div
        id="drift-probe"
        className="drift mt-10 h-24 w-full bg-sand"
        aria-hidden="true"
      />
      <div
        id="transition-probe"
        className="transition-colors duration-(--dur-base) h-0"
        aria-hidden="true"
      />

      <dl className="mt-8 divide-y divide-border border-y border-border">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-6 py-3">
            <dt className="text-[11px] tracking-[0.18em] uppercase text-ink/60">
              {c.label}
            </dt>
            <dd
              className={`text-sm text-right ${
                c.ok === false ? "text-red-700 font-medium" : ""
              }`}
            >
              {c.value}
            </dd>
          </div>
        ))}
      </dl>

      {checks.length > 0 && (
        <p className="mt-8 text-[15px] leading-relaxed">
          {blocked ? (
            <>
              <strong>Your system is set to reduce motion.</strong> Everything is working
              as built — the site is deliberately honouring that setting. Turn it off in{" "}
              <em>Windows Settings → Accessibility → Visual effects → Animation effects</em>{" "}
              (or macOS <em>System Settings → Accessibility → Display → Reduce motion</em>),
              then reload.
            </>
          ) : (
            <>
              Reduced motion is <strong>off</strong>, so animations should be running. The
              square above should be slowly zooming. If it is not, the problem is
              something else — tell me what this page reports.
            </>
          )}
        </p>
      )}

      <motion.div
        className="mt-10 h-16 w-16 bg-ink"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-3 text-xs text-ink/60">
        This square is driven by the Motion library. If it spins, Motion works.
      </p>
    </div>
  );
}
