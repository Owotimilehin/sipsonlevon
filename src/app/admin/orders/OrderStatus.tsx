"use client";

import { useRouter } from "next/navigation";
import type { OrderStatus as Status } from "@/lib/types";

const statuses: Status[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export function OrderStatus({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  return (
    <select
      defaultValue={status}
      className="mt-4 bg-ink border border-white/15 px-3 py-2 text-sm"
      onChange={async (e) => {
        await fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: e.target.value }),
        });
        router.refresh();
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
