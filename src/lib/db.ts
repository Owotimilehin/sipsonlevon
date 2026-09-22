import { sql } from "./pg";
import type { Order, OrderStatus, Product, User } from "./types";

/**
 * Postgres-backed store. Every export keeps the signature it had when this
 * was a JSON file, so callers did not change.
 *
 * The material difference is createOrder: stock is now decremented inside a
 * transaction that locks the product rows, which closes PRD §15 (two
 * simultaneous checkouts could both read the same count and oversell).
 */

/* ── row mapping ─────────────────────────────────────────────────────── */

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string | number;
  compare_at: string | number | null;
  description: string;
  fabric: string;
  images: string[];
  sizes: string[];
  stock: Record<string, number>;
  featured: boolean;
  published: boolean;
  created_at: Date;
};

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as Product["category"],
    price: Number(r.price),
    compareAt: r.compare_at == null ? undefined : Number(r.compare_at),
    description: r.description,
    fabric: r.fabric,
    images: r.images ?? [],
    sizes: r.sizes ?? [],
    stock: r.stock ?? {},
    featured: r.featured,
    published: r.published,
    createdAt: r.created_at.toISOString(),
  };
}

type OrderRow = {
  id: string;
  created_at: Date;
  status: string;
  user_id: string | null;
  customer: Order["customer"];
  items: Order["items"];
  subtotal: string | number;
  shipping: string | number;
  total: string | number;
  payment: Order["payment"] | null;
  notes: string | null;
  stock_restored: boolean;
};

function toOrder(r: OrderRow): Order {
  return {
    id: r.id,
    createdAt: r.created_at.toISOString(),
    status: r.status as OrderStatus,
    userId: r.user_id ?? undefined,
    customer: r.customer,
    items: r.items,
    subtotal: Number(r.subtotal),
    shipping: Number(r.shipping),
    total: Number(r.total),
    payment: r.payment ?? undefined,
    notes: r.notes ?? undefined,
    stockRestored: r.stock_restored,
  };
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

function toUser(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    passwordHash: r.password_hash,
    createdAt: r.created_at.toISOString(),
  };
}

/* ── products ────────────────────────────────────────────────────────── */

export async function listProducts(opts?: { all?: boolean }): Promise<Product[]> {
  const rows = opts?.all
    ? await sql<ProductRow[]>`SELECT * FROM products ORDER BY created_at DESC`
    : await sql<ProductRow[]>`
        SELECT * FROM products WHERE published = true ORDER BY created_at DESC`;
  return rows.map(toProduct);
}

export async function getProduct(idOrSlug: string): Promise<Product | null> {
  const [row] = await sql<ProductRow[]>`
    SELECT * FROM products WHERE id = ${idOrSlug} OR slug = ${idOrSlug} LIMIT 1`;
  return row ? toProduct(row) : null;
}

export async function saveProduct(product: Product): Promise<Product> {
  await sql`
    INSERT INTO products (
      id, slug, name, category, price, compare_at, description, fabric,
      images, sizes, stock, featured, published, created_at
    ) VALUES (
      ${product.id}, ${product.slug}, ${product.name}, ${product.category},
      ${product.price}, ${product.compareAt ?? null}, ${product.description},
      ${product.fabric}, ${sql.json(product.images)},
      ${sql.json(product.sizes)}, ${sql.json(product.stock)},
      ${product.featured}, ${product.published}, ${product.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug, name = EXCLUDED.name, category = EXCLUDED.category,
      price = EXCLUDED.price, compare_at = EXCLUDED.compare_at,
      description = EXCLUDED.description, fabric = EXCLUDED.fabric,
      images = EXCLUDED.images, sizes = EXCLUDED.sizes, stock = EXCLUDED.stock,
      featured = EXCLUDED.featured, published = EXCLUDED.published`;
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export function stockTotal(p: Product) {
  return Object.values(p.stock).reduce((a, b) => a + b, 0);
}

/* ── orders ──────────────────────────────────────────────────────────── */

export async function listOrders(): Promise<Order[]> {
  const rows = await sql<OrderRow[]>`SELECT * FROM orders ORDER BY created_at DESC`;
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const [row] = await sql<OrderRow[]>`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  return row ? toOrder(row) : null;
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const [row] = await sql<OrderRow[]>`
    SELECT * FROM orders WHERE payment ->> 'reference' = ${reference} LIMIT 1`;
  return row ? toOrder(row) : null;
}

/** The next customer-facing order number, from a sequence rather than a count. */
export async function nextOrderId(): Promise<string> {
  const [row] = await sql<{ n: string }[]>`SELECT nextval('order_number_seq') AS n`;
  return `SL-${row.n}`;
}

/**
 * Creates an order and takes the stock off the rail atomically.
 *
 * Product rows are locked FOR UPDATE before their counts are read, so two
 * concurrent checkouts serialise instead of both seeing the same figure.
 * If any line is short the transaction rolls back and no stock moves.
 */
export async function createOrder(order: Order): Promise<Order> {
  return sql.begin(async (tx) => {
    const ids = [...new Set(order.items.map((i) => i.productId))];
    const locked = await tx<{ id: string; name: string; stock: Record<string, number> }[]>`
      SELECT id, name, stock FROM products WHERE id = ANY(${ids}) FOR UPDATE`;

    const byId = new Map(locked.map((p) => [p.id, p]));
    const nextStock = new Map<string, Record<string, number>>();

    for (const item of order.items) {
      const p = byId.get(item.productId);
      if (!p) throw new Error(`Missing product ${item.productId}`);
      const current = nextStock.get(p.id) ?? { ...p.stock };
      const have = current[item.size] ?? 0;
      if (have < item.qty) throw new Error(`Out of stock: ${p.name} ${item.size}`);
      current[item.size] = have - item.qty;
      nextStock.set(p.id, current);
    }

    for (const [id, stock] of nextStock) {
      await tx`UPDATE products SET stock = ${sql.json(stock)} WHERE id = ${id}`;
    }

    await tx`
      INSERT INTO orders (
        id, created_at, status, user_id, customer, items,
        subtotal, shipping, total, payment, notes
      ) VALUES (
        ${order.id}, ${order.createdAt}, ${order.status}, ${order.userId ?? null},
        ${sql.json(order.customer)}, ${sql.json(order.items)},
        ${order.subtotal}, ${order.shipping}, ${order.total},
        ${order.payment ? sql.json(order.payment) : null},
        ${order.notes ?? null}
      )`;

    return order;
  });
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | null> {
  const [row] = await sql<OrderRow[]>`
    UPDATE orders SET
      status  = COALESCE(${patch.status ?? null}, status),
      notes   = COALESCE(${patch.notes ?? null}, notes),
      payment = COALESCE(${patch.payment ? sql.json(patch.payment) : null}, payment)
    WHERE id = ${id}
    RETURNING *`;
  return row ? toOrder(row) : null;
}

/**
 * Returns units to the rail when a payment fails or an operator cancels.
 *
 * The stock_restored flag is flipped inside the same transaction and checked
 * first, so a repeated call — a retried webhook, a double-click in admin —
 * cannot credit the same units twice.
 */
export async function restoreOrderStock(orderId: string): Promise<Order | null> {
  return sql.begin(async (tx) => {
    const [order] = await tx<OrderRow[]>`
      SELECT * FROM orders WHERE id = ${orderId} FOR UPDATE`;
    if (!order || order.stock_restored) return null;

    const ids = [...new Set(order.items.map((i) => i.productId))];
    const locked = await tx<{ id: string; stock: Record<string, number> }[]>`
      SELECT id, stock FROM products WHERE id = ANY(${ids}) FOR UPDATE`;

    const byId = new Map(locked.map((p) => [p.id, { ...p.stock }]));
    for (const item of order.items) {
      const stock = byId.get(item.productId);
      if (!stock) continue;
      stock[item.size] = (stock[item.size] ?? 0) + item.qty;
    }
    for (const [id, stock] of byId) {
      await tx`UPDATE products SET stock = ${sql.json(stock)} WHERE id = ${id}`;
    }

    const [updated] = await tx<OrderRow[]>`
      UPDATE orders SET stock_restored = true WHERE id = ${orderId} RETURNING *`;
    return toOrder(updated);
  });
}

/* ── users ───────────────────────────────────────────────────────────── */

export async function getUserByEmail(email: string): Promise<User | null> {
  const [row] = await sql<UserRow[]>`
    SELECT * FROM users WHERE lower(email) = lower(${email.trim()}) LIMIT 1`;
  return row ? toUser(row) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const [row] = await sql<UserRow[]>`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return row ? toUser(row) : null;
}

export async function createUser(user: User): Promise<User> {
  try {
    await sql`
      INSERT INTO users (id, name, email, password_hash, created_at)
      VALUES (${user.id}, ${user.name}, ${user.email.trim().toLowerCase()},
              ${user.passwordHash}, ${user.createdAt})`;
  } catch (err) {
    // 23505 = unique_violation on users_email_lower_idx.
    if ((err as { code?: string })?.code === "23505") {
      throw new Error("An account with that email already exists");
    }
    throw err;
  }
  return user;
}

/** A customer's orders: those placed signed in, plus guest orders on the same email. */
export async function listOrdersForUser(userId: string, email: string): Promise<Order[]> {
  const rows = await sql<OrderRow[]>`
    SELECT * FROM orders
    WHERE user_id = ${userId}
       OR lower(customer ->> 'email') = lower(${email.trim()})
    ORDER BY created_at DESC`;
  return rows.map(toOrder);
}
