/**
 * Creates the schema and loads the opening collection.
 *
 *   npm run db:migrate          schema only, plus seed if products is empty
 *   npm run db:migrate -- --force-seed   re-seed even if products exist
 *
 * Safe to run repeatedly: every statement is IF NOT EXISTS / ON CONFLICT, and
 * seeding is skipped once there is a catalogue, so it will not clobber live data.
 */
import { readFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import { seed } from "../src/lib/seed";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Put it in .env.local first.");
  process.exit(1);
}

const forceSeed = process.argv.includes("--force-seed");
const sql = postgres(url, {
  max: 1,
  ssl: url.includes("sslmode=disable") ? false : "require",
});

async function main() {
  const schema = await readFile(path.join(process.cwd(), "src/lib/schema.sql"), "utf8");
  await sql.unsafe(schema);
  console.log("schema applied");

  const [{ count }] = await sql<{ count: string }[]>`SELECT count(*) FROM products`;
  if (Number(count) > 0 && !forceSeed) {
    console.log(`products already has ${count} rows — skipping seed`);
    return;
  }

  for (const p of seed.products) {
    await sql`
      INSERT INTO products (
        id, slug, name, category, price, compare_at, description, fabric,
        images, sizes, stock, featured, published, created_at
      ) VALUES (
        ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.price},
        ${("compareAt" in p ? p.compareAt : null) ?? null}, ${p.description}, ${p.fabric},
        ${sql.json(p.images)}, ${sql.json(p.sizes)},
        ${sql.json(p.stock)}, ${p.featured}, ${p.published}, ${p.createdAt}
      )
      ON CONFLICT (id) DO NOTHING`;
  }
  console.log(`seeded ${seed.products.length} products`);

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
  console.log(`seeded ${seed.orders.length} orders`);

  // Move the sequence past any seeded SL- numbers so the next order is unique.
  await sql`
    SELECT setval(
      'order_number_seq',
      GREATEST(
        (SELECT COALESCE(MAX(split_part(id, '-', 2)::bigint), 1042)
           FROM orders),
        1042
      )
    )`;
  console.log("order sequence aligned");
}

main()
  .then(() => sql.end())
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await sql.end();
    process.exit(1);
  });
