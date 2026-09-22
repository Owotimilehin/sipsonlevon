-- SIPSONLEVON schema.
-- Replaces data/store.json. Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS products (
  id          text PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  category    text NOT NULL,
  price       bigint NOT NULL,
  compare_at  bigint,
  description text NOT NULL DEFAULT '',
  fabric      text NOT NULL DEFAULT '',
  images      jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes       jsonb NOT NULL DEFAULT '[]'::jsonb,
  stock       jsonb NOT NULL DEFAULT '{}'::jsonb,
  featured    boolean NOT NULL DEFAULT false,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_published_idx ON products (published, created_at DESC);
CREATE INDEX IF NOT EXISTS products_category_idx  ON products (category);

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Email uniqueness is case-insensitive: Ada@x.com and ada@x.com are one account.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- Order numbers come from a sequence, not from counting rows. Counting races:
-- two simultaneous checkouts both read the same count and collide on SL-1046.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1043;

CREATE TABLE IF NOT EXISTS orders (
  id             text PRIMARY KEY,
  created_at     timestamptz NOT NULL DEFAULT now(),
  status         text NOT NULL,
  user_id        text REFERENCES users (id) ON DELETE SET NULL,
  customer       jsonb NOT NULL,
  items          jsonb NOT NULL,
  subtotal       bigint NOT NULL,
  shipping       bigint NOT NULL,
  total          bigint NOT NULL,
  payment        jsonb,
  notes          text,
  stock_restored boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_idx    ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_email_idx   ON orders (lower(customer ->> 'email'));

-- Payment reference lookup, used to reconcile OPay callbacks.
CREATE INDEX IF NOT EXISTS orders_payment_ref_idx ON orders ((payment ->> 'reference'));
