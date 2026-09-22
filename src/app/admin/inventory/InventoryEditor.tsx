"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

export function InventoryEditor({ products }: { products: Product[] }) {
  const router = useRouter();

  async function save(id: string, stock: Record<string, number>) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
    router.refresh();
  }

  return (
    <div className="mt-10 space-y-8">
      {products.map((p) => (
        <form
          key={p.id}
          className="border border-white/10 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const stock: Record<string, number> = {};
            for (const s of p.sizes) stock[s] = Number(fd.get(s) || 0);
            save(p.id, stock);
          }}
        >
          <div className="flex justify-between">
            <p className="serif text-2xl">{p.name}</p>
            <button className="text-[11px] tracking-[0.18em] uppercase border border-white/20 px-3 py-1">
              Update
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {p.sizes.map((s) => (
              <label key={s} className="text-xs">
                {s}
                <input
                  name={s}
                  type="number"
                  defaultValue={p.stock[s] ?? 0}
                  className="ml-2 w-16 bg-transparent border border-white/15 px-2 py-1"
                />
              </label>
            ))}
          </div>
        </form>
      ))}
    </div>
  );
}
