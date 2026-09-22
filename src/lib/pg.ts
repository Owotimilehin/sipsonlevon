import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

/**
 * One Postgres client per process, created on first use.
 *
 * Lazy on purpose: Next collects page data at build time by importing every
 * route module, so connecting at module scope makes the build require a live
 * DATABASE_URL — and fail without one. Nothing connects until a request
 * actually queries.
 *
 * Serverless caveat: every warm instance holds its own client, so the pool is
 * capped at 1 and DATABASE_URL must be a *pooled* connection string (Neon's
 * `-pooler` host, or Supabase port 6543). A direct connection string will
 * exhaust the Postgres connection limit once a few instances are warm.
 */
declare global {
  var __sl_sql: Sql | undefined;
}

function connect(): Sql {
  if (globalThis.__sl_sql) return globalThis.__sl_sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Postgres instance."
    );
  }

  const client = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: url.includes("sslmode=disable") ? false : "require",
  });

  globalThis.__sl_sql = client;
  return client;
}

/**
 * Stands in for the postgres client. Calling it runs a tagged template;
 * reading a property (`sql.json`, `sql.begin`) forwards to the real client.
 * Either way the connection is established on first touch, not on import.
 */
export const sql = new Proxy(function () {} as unknown as Sql, {
  apply(_target, _thisArg, args: Parameters<Sql>) {
    return connect()(...args);
  },
  get(_target, prop: string | symbol) {
    const client = connect() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as Sql;
