"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sizes = String(fd.get("sizes") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const stock: Record<string, number> = {};
    for (const s of sizes) stock[s] = Number(fd.get(`stock_${s}`) || 0);
    const payload = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      category: fd.get("category"),
      price: Number(fd.get("price")),
      compareAt: fd.get("compareAt") ? Number(fd.get("compareAt")) : undefined,
      description: fd.get("description"),
      fabric: fd.get("fabric"),
      images: String(fd.get("images") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      sizes,
      stock,
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    };
    const url = product ? `/api/products/${product.id}` : "/api/products";
    const res = await fetch(url, {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Save failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    if (!product) return;
    if (!confirm("Delete this piece?")) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  const sizes = product?.sizes.join(",") || "XS,S,M,L";

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4 max-w-2xl">
      <input name="name" defaultValue={product?.name} required placeholder="Name" className="bg-transparent border border-white/15 px-4 py-3" />
      <input name="slug" defaultValue={product?.slug} placeholder="slug" className="bg-transparent border border-white/15 px-4 py-3" />
      <select name="category" defaultValue={product?.category || "womenswear"} className="bg-ink border border-white/15 px-4 py-3">
        <option value="womenswear">womenswear</option>
        <option value="unisex">unisex</option>
        <option value="tailoring">tailoring</option>
        <option value="outerwear">outerwear</option>
      </select>
      <input name="price" type="number" defaultValue={product?.price} required placeholder="Price NGN" className="bg-transparent border border-white/15 px-4 py-3" />
      <input name="compareAt" type="number" defaultValue={product?.compareAt} placeholder="Compare at" className="bg-transparent border border-white/15 px-4 py-3" />
      <textarea name="description" defaultValue={product?.description} rows={5} className="bg-transparent border border-white/15 px-4 py-3" />
      <input name="fabric" defaultValue={product?.fabric} placeholder="Fabric" className="bg-transparent border border-white/15 px-4 py-3" />
      <textarea name="images" defaultValue={product?.images.join("\n")} rows={3} placeholder="Image URLs, one per line" className="bg-transparent border border-white/15 px-4 py-3" />
      <input name="sizes" defaultValue={sizes} placeholder="Sizes comma separated" className="bg-transparent border border-white/15 px-4 py-3" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(product?.sizes || ["XS", "S", "M", "L"]).map((s) => (
          <label key={s} className="text-xs">
            {s}
            <input
              name={`stock_${s}`}
              type="number"
              defaultValue={product?.stock[s] ?? 0}
              className="mt-1 w-full bg-transparent border border-white/15 px-2 py-2"
            />
          </label>
        ))}
      </div>
      <label className="text-sm flex gap-2 items-center">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
      </label>
      <label className="text-sm flex gap-2 items-center">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? true} /> Published
      </label>
      <div className="flex gap-3">
        <button className="bg-paper text-ink px-6 py-3 text-[11px] tracking-[0.2em] uppercase">Save</button>
        {product ? (
          <button type="button" onClick={remove} className="border border-white/20 px-6 py-3 text-[11px] tracking-[0.2em] uppercase">
            Delete
          </button>
        ) : null}
      </div>
      {msg ? <p className="text-sm text-red-300">{msg}</p> : null}
    </form>
  );
}
