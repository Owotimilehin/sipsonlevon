import postgres from "postgres";

/**
 * One Postgres client per process.
 *
 * Serverless caveat: every warm instance holds its own client, so the pool is
 * capped at 1 and DATABASE_URL must be a *pooled* connection string (Neon's
 * `-pooler` host, or Supabase's port 6543). A direct connection string will
 * exhaust Postgres' connection limit once a few instances are warm.
 */
declare global {
  var __sl_sql: ReturnType<typeof postgres> | undefined;
}

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Postgres instance."
    );
  }
  return postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    // Hosted Postgres terminates TLS at the pooler with its own certificate.
    ssl: url.includes("sslmode=disable") ? false : "require",
  });
}

// Reused across hot reloads in dev so the connection count stays at one.
export const sql = globalThis.__sl_sql ?? create();
if (process.env.NODE_ENV !== "production") globalThis.__sl_sql = sql;
