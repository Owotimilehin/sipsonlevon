"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const field =
  "w-full border border-border-strong bg-transparent px-4 py-3 text-base sm:text-sm outline-none " +
  "transition-colors duration-(--dur-base) focus:border-ink";

const EASE = [0.22, 1, 0.36, 1] as const;

export function AccountForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reduce = useReducedMotion();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const payload =
      mode === "register"
        ? { name: fd.get("name"), email: fd.get("email"), password: fd.get("password") }
        : { email: fd.get("email"), password: fd.get("password") };

    const res = await fetch(`/api/account/${mode === "register" ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-6 text-[11px] tracking-[0.22em] uppercase">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`relative pb-2 transition-colors ${
              mode === m ? "text-ink" : "text-ink/60 hover:text-ink/70"
            }`}
          >
            {m === "login" ? "Sign in" : "Create account"}
            {mode === m && (
              <motion.span
                layoutId="account-tab"
                className="absolute inset-x-0 bottom-0 h-px bg-accent-ink"
                transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <AnimatePresence initial={false} mode="popLayout">
          {mode === "register" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.32, ease: EASE }}
              className="overflow-hidden"
            >
              <input name="name" required placeholder="Name" aria-label="Name" className={field} />
            </motion.div>
          )}
        </AnimatePresence>

        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          className={field}
        />
        <input
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder={mode === "register" ? "Password (8 characters or more)" : "Password"}
          aria-label="Password"
          className={field}
        />

        <button
          disabled={busy}
          className="w-full bg-ink text-paper py-3.5 text-[11px] tracking-[0.28em] uppercase transition-colors hover:bg-ink/85 disabled:opacity-50"
        >
          {busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              role="alert"
              className="text-sm text-ink/70"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </form>

      <p className="mt-8 text-[11px] leading-relaxed text-ink/60">
        An account keeps your order history. You can always{" "}
        <Link href="/checkout" className="rule-draw">
          check out as a guest
        </Link>
        .
      </p>
    </div>
  );
}
