import { NextResponse } from "next/server";
import { listProducts, saveProduct } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { uid } from "@/lib/money";
import type { Product } from "@/lib/types";

export async function GET() {
  const products = await listProducts({ all: await isAdmin() });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const product: Product = {
    id: uid("p"),
    slug: String(body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    name: body.name,
    category: body.category || "unisex",
    price: Number(body.price),
    compareAt: body.compareAt ? Number(body.compareAt) : undefined,
    description: body.description || "",
    fabric: body.fabric || "",
    images: Array.isArray(body.images) ? body.images : String(body.images || "").split("\n").filter(Boolean),
    sizes: Array.isArray(body.sizes) ? body.sizes : String(body.sizes || "S,M,L").split(",").map((s: string) => s.trim()),
    stock: body.stock || {},
    featured: Boolean(body.featured),
    published: body.published !== false,
    createdAt: new Date().toISOString(),
  };
  if (!product.stock || Object.keys(product.stock).length === 0) {
    product.stock = Object.fromEntries(product.sizes.map((s) => [s, Number(body.qty || 0)]));
  }
  await saveProduct(product);
  return NextResponse.json(product);
}
