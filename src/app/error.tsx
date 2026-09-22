"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70dvh] flex items-center px-5 md:px-8">
      <div className="mx-auto max-w-xl w-full">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Something broke</p>
        <h1 className="serif-display text-5xl md:text-7xl mt-4">A dropped stitch.</h1>
        <p className="mt-8 text-[17px] leading-relaxed text-ink/70 max-w-md">
          This page did not load. Try again — if it keeps happening, tell the studio and
          quote the reference below.
        </p>
        {error.digest ? (
          <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-ink/60">
            Reference {error.digest}
          </p>
        ) : null}
        <div className="gold-rule my-10" />
        <div className="flex flex-wrap gap-6 text-[11px] tracking-[0.24em] uppercase">
          <button
            onClick={reset}
            className="bg-ink text-paper px-8 py-3.5 hover:bg-ink/85 transition-colors"
          >
            Try again
          </button>
          <Link href="/contact" className="rule-draw self-center">
            Tell the studio
          </Link>
        </div>
      </div>
    </div>
  );
}
