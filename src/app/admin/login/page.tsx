"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") || "");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Access denied.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <p className="text-[11px] tracking-[0.35em] uppercase text-gold">Atelier</p>
        <h1 className="serif text-4xl mt-3">SIPSONLEVON</h1>
        <input
          name="password"
          type="password"
          placeholder="Admin password"
          className="mt-10 w-full bg-transparent border border-white/20 px-4 py-3 text-base sm:text-sm outline-none"
        />
        <button className="mt-4 w-full bg-paper text-ink py-3 text-[11px] tracking-[0.28em] uppercase">
          Enter
        </button>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </form>
    </div>
  );
}
