"use client";

import { useState } from "react";

export function RetryPayment({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/payments/opay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (res.ok && data.cashierUrl) {
      window.location.href = data.cashierUrl;
      return;
    }
    setBusy(false);
    setError(data.error || "Could not reopen payment");
  }

  return (
    <div className="mt-8">
      <button
        onClick={pay}
        disabled={busy}
        className="bg-ink text-paper px-10 py-3.5 text-[11px] tracking-[0.28em] uppercase transition-colors hover:bg-ink/85 disabled:opacity-50"
      >
        {busy ? "Opening…" : "Complete payment"}
      </button>
      {error ? <p className="mt-3 text-sm text-ink/70">{error}</p> : null}
    </div>
  );
}
