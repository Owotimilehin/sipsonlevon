# SIPSONLEVON

Luxury fashion house web app: multi-page storefront plus atelier admin for products, live inventory, and orders.

## Run

```bash
npm install
cp .env.example .env.local     # then fill in DATABASE_URL
npm run db:migrate             # create tables + load the opening collection
npm run dev
```

Open http://localhost:3000

No Postgres to hand? A throwaway one:

```bash
docker run -d --name sl-pg -e POSTGRES_PASSWORD=sl -e POSTGRES_DB=sipsonlevon \
  -p 55432:5432 postgres:16-alpine
# DATABASE_URL=postgres://postgres:sl@localhost:55432/sipsonlevon?sslmode=disable
```

## Admin

- URL: /admin/login
- Password: whatever you set as `ADMIN_PASSWORD`

`ADMIN_PASSWORD` and `ADMIN_TOKEN` are required — there is no built-in default,
so a deploy that forgets them fails loudly instead of shipping a known password.

## Storefront

Home, shop with category filters, product pages, lookbook, house note, contact, bag,
checkout, order confirmation.

Service and legal pages: /shipping, /size-guide, /care, /faq, /privacy, /terms.

Orders deduct stock immediately. Complimentary shipping over NGN 250,000.

## Accounts and saved pieces

- `/account/login` — sign in or create an account (email + password).
- `/account` — order history. Orders placed as a guest with the same email are
  included, so history survives the upgrade from guest to account.
- `/saved` — wishlist. Stored in the browser under `sl_saved`, like the bag.

Guest checkout still works without an account, per the PRD sign-off list.
Passwords are hashed with scrypt; sessions are an HMAC-signed httpOnly cookie
keyed on `ACCOUNT_SECRET`.

## Payments — OPay

Checkout hands the order to the OPay Cashier and redirects to their hosted page.

```
OPAY_MERCHANT_ID=
OPAY_PUBLIC_KEY=
OPAY_SECRET_KEY=
OPAY_ENV=sandbox        # or live
SITE_URL=https://your-domain
```

- **Create** uses public-key auth against `/api/v1/international/cashier/create`.
- **Status** uses HMAC-SHA512 over `RequestBody={body}&RequestTimestamp={ts}`.
- The callback at `/api/payments/opay/callback` is **not** trusted on its own —
  OPay publishes no webhook signature scheme for the Cashier API, so the callback
  only triggers a status re-query. The confirmation page reconciles too, in case
  the customer returns before the callback lands.
- Amounts are sent in kobo and checked against the order total before anything is
  marked paid.
- Failed or closed payments return stock to the rail.

**Without OPay keys configured**, checkout falls back to v1 behaviour and marks
orders paid locally, so development and the acceptance walk still work.

## Data

Postgres. Schema lives in `src/lib/schema.sql` and is applied by:

```bash
npm run db:migrate                  # schema, plus seed if the catalogue is empty
npm run db:migrate -- --force-seed  # re-seed regardless
```

Idempotent: it will not overwrite a catalogue that already has rows.

`DATABASE_URL` must be a **pooled** connection string on serverless — Neon's
`-pooler` host, or Supabase port 6543. A direct connection exhausts the
Postgres connection limit once several instances are warm.

Stock is decremented inside a transaction that locks the product rows
`FOR UPDATE`, so concurrent checkouts cannot oversell. That closes PRD §15.
Order numbers come from a sequence rather than a row count, so simultaneous
checkouts cannot collide on the same SL- number. Numbers may skip when an
order fails — sequences do not roll back, and gaps are preferable to clashes.

## Deploy to Vercel

Provision Postgres first (Neon, Supabase, or Vercel Postgres), then:

```bash
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add ACCOUNT_SECRET production
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_TOKEN production
vercel env add SITE_URL production
vercel --prod
```

Run `npm run db:migrate` once against the production database, with
`DATABASE_URL` pointed at it.

Add the OPay keys only after one complete test order has gone through on
sandbox — a deploy that can take money but cannot record orders is worse
than one that cannot take money.

## Before deploy

- Generate real secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Quote any env value containing `#`, or dotenv truncates it at the `#`.
- `SITE_URL` must be public HTTPS or OPay callbacks cannot reach you.
- Have the privacy and terms pages reviewed, and add the registered legal entity name.
- Replace the Unsplash stand-in photography.
- Walk the PRD §14 acceptance list on a phone and a laptop.
