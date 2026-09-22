import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { sql } from "@/lib/pg";
import { seed } from "@/lib/seed";

/**
 * Applies the schema and, if the catalogue is empty, the opening collection.
 *
 * Exists because managed Postgres integrations mark their connection string
 * as sensitive: it is readable inside the deployment but cannot be pulled
 * locally, so the migration has to run from here rather than a laptop.
 *
 * Admin-only and idempotent. POST /api/admin/migrate?seed=force re-seeds.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schema = await readFile(
      path.join(process.cwd(), "src/lib/schema.sql"),
      "utf8"
    );
    await sql.unsafe(schema);

    const force = new URL(req.url).searchParams.get("seed") === "force";
    const [{ count }] = await sql<{ count: string }[]>`SELECT count(*) FROM products`;

    if (Number(count) > 0 && !force) {
      return NextResponse.json({
        schema: "applied",
        seed: "skipped",
        products: Number(count),
      });
    }

    for (const p of seed.products) {
      await sql`
        INSERT INTO products (
          id, slug, name, category, price, compare_at, description, fabric,
          images, sizes, stock, featured, published, created_at
        ) VALUES (
          ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.price},
          ${("compareAt" in p ? p.compareAt : null) ?? null}, ${p.description},
          ${p.fabric}, ${sql.json(p.images)}, ${sql.json(p.sizes)},
          ${sql.json(p.stock)}, ${p.featured}, ${p.published}, ${p.createdAt}
        )
        ON CONFLICT (id) DO NOTHING`;
    }

    for (const o of seed.orders) {
      await sql`
        INSERT INTO orders (
          id, created_at, status, customer, items, subtotal, shipping, total
        ) VALUES (
          ${o.id}, ${o.createdAt}, ${o.status}, ${sql.json(o.customer)},
          ${sql.json(o.items)}, ${o.subtotal}, ${o.shipping}, ${o.total}
        )
        ON CONFLICT (id) DO NOTHING`;
    }

    await sql`
      SELECT setval(
        'order_number_seq',
        GREATEST(
          (SELECT COALESCE(MAX(split_part(id, '-', 2)::bigint), 1042)
             FROM orders),
          1042
        )
      )`;

    const [{ count: after }] = await sql<{ count: string }[]>`SELECT count(*) FROM products`;
    return NextResponse.json({
      schema: "applied",
      seed: "loaded",
      products: Number(after),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
