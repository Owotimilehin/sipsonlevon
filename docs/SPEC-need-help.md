# Spec — "Need help" footer section

Status: approved, not yet built · 22 September 2026
Supersedes nothing. Extends the PRD; deviations are marked.

Four customer-service surfaces reachable from one footer column. Two already
exist and need tightening; two must be built.

| Feature | Today | This spec |
|---|---|---|
| FAQs | `/faq` works | Deep-linkable, searchable by anchor |
| Shipping & Returns | `/shipping` works | Add tracking cross-link |
| Order Tracking | **missing** | Build, and close a live privacy hole |
| Send A Message | form is inert | Build end to end: store, notify, triage |

---

## 0. The hole this must close first

`/order/[id]` is public and unauthenticated. Order ids are sequential
(`SL-1041`, `SL-1042`, …), so anyone can walk the order book and read customer
names, line items, values and delivery status. Verified live on production.

Shipping an order-tracking feature over that would advertise the enumeration.
Section 3 closes it as part of the same change.

---

## 1. Footer column

Replace the `Service` column with `Need help`, and move Contact into it.
`Visit` keeps Shop / Lookbook / The House. Size guide and Garment care move
under `Need help` as secondary entries — they are service, not navigation.

```
NEED HELP
  FAQs                → /faq
  Shipping & returns  → /shipping
  Order tracking      → /track
  Send a message      → /contact
  Size guide          → /size-guide
  Garment care        → /care
```

House voice: sentence case after the first word, matching the existing footer.
Heading uses the established `text-[11px] tracking-[0.2em] uppercase text-ink/60`.
Each link keeps the `rule-draw` gold underline.

**Acceptance**
- All six links resolve 200 from the footer on every page.
- Column heading reads "Need help".
- Mobile: column stacks, no horizontal overflow at 320px.
- Tab order follows visual order; every link has a visible focus ring.

---

## 2. FAQs — tighten

Exists at `/faq` with an accordion. Gaps:

1. **Not deep-linkable.** Support cannot send "see this answer".
   Each question gets a stable slug id (`#returns-window`), and a matching
   `#hash` on load opens that item and scrolls to it.
2. **No payment or tracking answers.** Add: "How do I track my order?"
   (links `/track`), "How do I pay?" (already present, verify it names OPay),
   "I never got my order number."
3. **Accordion state is single-open.** Keep it — it is a short list, and
   multiple-open turns the page into a wall.

**Acceptance**
- `/faq#returns-window` opens that answer, expanded, scrolled into view.
- Every question has a unique, stable id that does not change when the order
  of questions changes.
- Accordion is operable by keyboard: Enter/Space toggles, focus visible.
- `aria-expanded` tracks state on every trigger.

---

## 3. Order tracking — build

### Route: `/track`

A single form: **order number** and **email address**. Both required.

Copy: "Your order number is on your confirmation, starting SL-. Enter the
email you used at checkout." No account required — this is the guest path.

### Access model

An order is readable when **any** of these hold:

| Condition | How |
|---|---|
| Valid signed token for that order in the URL | `?t=<hmac>` |
| Signed-in customer owns it | `userId` match, or `customer.email` match |
| Staff | `isAdmin()` |

Otherwise `/order/[id]` renders the lookup form inline, pre-filled with the
id, asking only for the email. Never a 404 and never a 403 — both confirm
whether an order number exists.

### The signed token

```
t = HMAC-SHA256(ACCOUNT_SECRET, `${orderId}:${lowercase(email)}`)
```

- Issued at checkout: redirect becomes `/order/SL-1043?t=…`.
- Issued on successful lookup: the form redirects to the same shape.
- Compared with `timingSafeEqual`.
- No expiry. It is a receipt link, and a customer may open it months later.
- Scoped to one order: a token for `SL-1043` proves nothing about `SL-1044`.

Rotating `ACCOUNT_SECRET` invalidates every issued link. That is the documented
trade-off; note it beside the variable in `.env.example`.

### `POST /api/orders/lookup`

Body `{ orderId, email }`. Returns `{ url }` on success.

- **Generic failure.** One message for wrong id, wrong email, and unknown
  order: "We could not find an order with those details." Anything more
  specific confirms which order numbers exist.
- **Rate limited**: 10 attempts per 15 minutes per IP, same shape as the
  existing admin and account limiters. 429 with a plain message.
- **Timing-safe** email comparison, lowercased and trimmed both sides.
- Never returns order contents — only a URL.

### What the customer sees

`/order/[id]` already renders status, line items, totals and the OPay state.
Add a plain-language status line and the dispatch expectation:

| Status | Line |
|---|---|
| pending | Awaiting payment. We hold the pieces until it clears. |
| paid | Confirmed. The studio has your order. |
| processing | In the studio, being prepared for dispatch. |
| shipped | On its way. 1–2 working days in Lagos, 2–5 elsewhere. |
| delivered | Delivered. Thank you. |
| cancelled | Cancelled. Nothing was charged. |

Do not invent a courier tracking number. The PRD has no carrier integration,
and a fake tracking field is worse than none.

**Acceptance**
- Correct number + correct email → the order opens.
- Correct number + wrong email → generic failure, no data.
- Guessed number `SL-1044` with no token and no session → lookup form, no data.
- A stranger fetching `/order/SL-1041` gets no customer name in the HTML **or
  in the server payload**. Verify with view-source, not just the rendered page.
- Checkout still lands the buyer straight on their receipt, no re-entry.
- A signed-in customer opens any of their own orders from `/account` with no
  token in the URL.
- 11th lookup attempt inside 15 minutes returns 429.
- `/track` and `/order/[id]` both carry `robots: noindex`.

---

## 4. Send a message — build

The form at `/contact` has no handler. It is a dead end that silently discards
customer enquiries.

### Storage — source of truth

```sql
CREATE TABLE messages (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  body       text NOT NULL,
  order_id   text,                        -- optional, if they quote one
  status     text NOT NULL DEFAULT 'new', -- new | read | answered | spam
  created_at timestamptz NOT NULL DEFAULT now(),
  notified   boolean NOT NULL DEFAULT false
);
CREATE INDEX messages_status_idx  ON messages (status, created_at DESC);
CREATE INDEX messages_created_idx ON messages (created_at DESC);
```

### `POST /api/messages`

Public. Validates, stores, then attempts the email notification.

**The write is the success condition.** If Resend fails, the endpoint still
returns 200, the row persists with `notified = false`, and a later retry can
pick it up. An enquiry is never lost because a mail provider had a bad minute.

Validation:
- `name` 1–100 chars, required
- `email` must match the same pattern used at registration
- `body` 10–5000 chars — a 10-char floor stops one-word junk
- `orderId` optional, pattern `SL-\d+`

Anti-spam, no CAPTCHA (a captcha on a luxury contact form is a tax on real
customers):
- **Honeypot** field, visually hidden, non-empty means drop silently with 200.
- **Time trap**: a hidden timestamp; submissions under 3 seconds are dropped.
- **Rate limit**: 5 per hour per IP.

### Notification

Resend → `hello@sipsonlevon.com`. Subject: `New enquiry — <name>`. Body
carries the message, the sender's email as `reply-to`, the order id when given,
and a link to `/admin/messages`.

Requires `RESEND_API_KEY` and a DNS-verified sending domain. **Unset means no
email, not an error** — the same pattern as OPay. Storage still works.

### `/admin/messages`

- List newest first: name, email, first line, age, status.
- Filter by status. Unread count badge on the admin nav.
- Open one → full body, `mailto:` reply prefilled with their address and any
  order number, and status controls.
- Status: new → read → answered, plus spam.
- Matches the dark atelier chrome. No new design language.

### Customer-facing states

| State | Behaviour |
|---|---|
| Submitting | Button reads "Sending…", disabled, form locked |
| Success | Form replaced by a confirmation naming the two-working-day promise |
| Validation error | Inline, under the offending field, `aria-describedby` |
| Server error | Message above the button; **the typed text is preserved** |

Never clear a customer's typed message on failure.

**Acceptance**
- Submitting stores a row and returns 200.
- With `RESEND_API_KEY` unset: row stored, `notified=false`, 200, no error shown.
- With Resend failing: same. Verify by pointing the key at an invalid value.
- Honeypot filled → 200, no row.
- Submitted in under 3s → 200, no row.
- 6th submission in an hour → 429.
- Message appears in `/admin/messages` within one refresh.
- Unauthenticated `GET /api/messages` → 401.
- Server error preserves the typed body in the field.

---

## 5. Out of scope

Named so they are not silently assumed:

- Courier tracking numbers or carrier API integration.
- Live chat.
- Email threading or replying from inside admin (`mailto:` only).
- Customer-facing message history.
- Automated order-status emails. Separate piece of work.

---

## 6. Build order

Each step ships independently and leaves the site working.

1. **Close the order hole** — token issuance, access checks, `/order/[id]`
   gating. Highest severity, smallest change, no new UI.
2. **`/track`** — the form and the lookup endpoint, on top of step 1.
3. **Messages** — table, endpoint, contact form wiring, admin view.
4. **Footer column** — last, once every destination exists. Shipping a
   "Need help" column that links to a 404 is worse than not shipping it.
5. **FAQ anchors** — independent, any time.

Steps 1 and 3 both touch the schema; both are additive and idempotent, and
run through the existing `/api/admin/migrate` route.
