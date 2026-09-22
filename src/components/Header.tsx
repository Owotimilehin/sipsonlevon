"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "The House" },
  { href: "/contact", label: "Contact" },
];

function countCart() {
  try {
    const raw = localStorage.getItem("sl_cart");
    const items = raw ? (JSON.parse(raw) as { qty: number }[]) : [];
    return items.reduce((a, b) => a + b.qty, 0);
  } catch {
    return 0;
  }
}

function countSaved() {
  try {
    const raw = localStorage.getItem("sl_saved");
    return raw ? (JSON.parse(raw) as string[]).length : 0;
  } catch {
    return 0;
  }
}

export function Header() {
  const [bag, setBag] = useState(0);
  const [saved, setSaved] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const readBag = () => setBag(countCart());
    const readSaved = () => setSaved(countSaved());
    readBag();
    readSaved();
    window.addEventListener("sl-cart", readBag);
    window.addEventListener("sl-saved", readSaved);
    window.addEventListener("storage", readBag);
    window.addEventListener("storage", readSaved);
    return () => {
      window.removeEventListener("sl-cart", readBag);
      window.removeEventListener("sl-saved", readSaved);
      window.removeEventListener("storage", readBag);
      window.removeEventListener("storage", readSaved);
    };
  }, []);

  // Re-checked per route so the icon reflects sign-in/out without a reload.
  useEffect(() => {
    let live = true;
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => {
        if (live) setSignedIn(Boolean(d?.user));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [path]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50">
      <p className="bg-ink text-paper text-center text-[10px] md:text-[11px] tracking-[0.28em] uppercase py-2">
        Complimentary delivery across Nigeria from ₦250,000
      </p>
      <div className="border-b border-border bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-8 py-4">
          <button
            className="md:hidden -ml-1 grid h-9 w-9 shrink-0 place-items-center"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
              <motion.path
                d="M0 1h18"
                stroke="currentColor"
                strokeWidth="1"
                animate={open ? { d: "M2 1l14 10" } : { d: "M0 1h18" }}
                transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.path
                d="M0 11h18"
                stroke="currentColor"
                strokeWidth="1"
                animate={open ? { d: "M2 11l14-10" } : { d: "M0 11h18" }}
                transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </button>

          <nav className="hidden md:flex gap-8 text-[11px] tracking-[0.24em] uppercase text-ink/65">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={close}
                className={`rule-draw hover:text-ink transition-colors duration-(--dur-base) ${
                  path?.startsWith(n.href) ? "text-ink" : ""
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            onClick={close}
            className="serif whitespace-nowrap text-[13px] tracking-[0.18em] sm:text-[16px] sm:tracking-[0.24em] md:text-[30px] md:tracking-[0.34em] uppercase"
          >
            Sipsonlevon
          </Link>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
            <IconLink
              href="/saved"
              onClick={close}
              label={`Saved, ${saved} ${saved === 1 ? "piece" : "pieces"}`}
              count={saved}
              reduce={reduce}
            >
              <path d="M10 16.5S1.5 11.6 1.5 5.9A4.4 4.4 0 0 1 10 4.2a4.4 4.4 0 0 1 8.5 1.7c0 5.7-8.5 10.6-8.5 10.6Z" />
            </IconLink>

            <IconLink
              href={signedIn ? "/account" : "/account/login"}
              onClick={close}
              label={signedIn ? "Your account" : "Sign in"}
              reduce={reduce}
            >
              <circle cx="10" cy="6.2" r="3.4" />
              <path d="M3.2 18c0-3.6 3-6.2 6.8-6.2s6.8 2.6 6.8 6.2" />
            </IconLink>

            <IconLink
              href="/cart"
              onClick={close}
              label={`Bag, ${bag} ${bag === 1 ? "item" : "items"}`}
              count={bag}
              reduce={reduce}
            >
              <path d="M1.7 5.5h16.6l-1.1 13.2a1.3 1.3 0 0 1-1.3 1.2H4.1a1.3 1.3 0 0 1-1.3-1.2L1.7 5.5Z" />
              <path d="M6.4 8.1V4.3a3.6 3.6 0 0 1 7.2 0v3.8" />
            </IconLink>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="px-5 pb-6 pt-4 flex flex-col gap-4 text-[12px] tracking-[0.22em] uppercase">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} onClick={close}>
                    {n.label}
                  </Link>
                ))}
                <Link href="/saved" onClick={close} className="text-ink/60">
                  Saved
                </Link>
                <Link
                  href={signedIn ? "/account" : "/account/login"}
                  onClick={close}
                  className="text-ink/60"
                >
                  {signedIn ? "Your account" : "Sign in"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  count,
  children,
  onClick,
  reduce,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
  onClick: () => void;
  reduce: boolean | null;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      className="relative -m-2 inline-grid h-11 w-11 place-items-center text-ink/70 hover:text-ink transition-colors duration-(--dur-base)"
    >
      <svg
        width="19"
        height="21"
        viewBox="0 0 20 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
      <AnimatePresence>
        {typeof count === "number" && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-ink px-1 text-[9px] leading-none tracking-normal text-paper tabular-nums"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

const service = [
  { href: "/shipping", label: "Shipping & returns" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/care", label: "Garment care" },
  { href: "/faq", label: "FAQ" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <p className="serif text-3xl tracking-[0.28em] uppercase">Sipsonlevon</p>
          <p className="mt-5 text-sm text-ink/60 max-w-sm leading-relaxed">
            Ready-to-wear cut in Lagos. Quiet pieces for evenings that start late
            and mornings that do not need explaining.
          </p>
        </div>

        <div className="md:col-span-2 text-[11px] tracking-[0.2em] uppercase space-y-3 text-ink/70">
          <p className="text-ink/60">Visit</p>
          {nav.map((n) => (
            <p key={n.href}>
              <Link href={n.href} className="rule-draw">
                {n.label}
              </Link>
            </p>
          ))}
        </div>

        <div className="md:col-span-2 text-[11px] tracking-[0.2em] uppercase space-y-3 text-ink/70">
          <p className="text-ink/60">Service</p>
          {service.map((n) => (
            <p key={n.href}>
              <Link href={n.href} className="rule-draw">
                {n.label}
              </Link>
            </p>
          ))}
        </div>

        <div className="md:col-span-3 text-sm text-ink/60">
          <p className="text-[11px] tracking-[0.2em] uppercase text-ink/60">Studio</p>
          <p className="mt-3">Ikeja, Lagos</p>
          <p className="mt-1">hello@sipsonlevon.com</p>
          <p className="mt-1 text-ink/60">Tue–Sat · 11:00–18:00 WAT</p>
          <div className="mt-8 flex gap-4 text-[10px] tracking-[0.2em] uppercase text-ink/60">
            {legal.map((n) => (
              <Link key={n.href} href={n.href} className="rule-draw">
                {n.label}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-[10px] tracking-[0.2em] uppercase text-ink/60">
            © {new Date().getFullYear()} Sipsonlevon
          </p>
        </div>
      </div>
    </footer>
  );
}
