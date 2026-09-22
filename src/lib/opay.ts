import { createHmac } from "crypto";

/**
 * OPay Cashier integration.
 *
 * Endpoints and field names follow OPay's International Cashier API:
 *   create → /api/v1/international/cashier/create   (public-key auth)
 *   status → /api/v1/international/cashier/status   (HMAC-SHA512 signature auth)
 *
 * Amounts are sent in the currency's minor unit ("cent units" per the docs),
 * so naira are multiplied by 100 on the way out and divided on the way back.
 */

const LIVE = "https://api.opaycheckout.com";
const SANDBOX = "https://sandboxapi.opaycheckout.com";

function config() {
  const merchantId = process.env.OPAY_MERCHANT_ID;
  const publicKey = process.env.OPAY_PUBLIC_KEY;
  const secretKey = process.env.OPAY_SECRET_KEY;
  const live = process.env.OPAY_ENV === "live";
  return {
    merchantId,
    publicKey,
    secretKey,
    base: live ? LIVE : SANDBOX,
    configured: Boolean(merchantId && publicKey && secretKey),
  };
}

export function opayConfigured() {
  return config().configured;
}

/** Signature auth: HMAC-SHA512 over `RequestBody={body}&RequestTimestamp={ts}`. */
function signRequest(body: string, timestamp: string, secretKey: string) {
  return createHmac("sha512", secretKey)
    .update(`RequestBody=${body}&RequestTimestamp=${timestamp}`)
    .digest("base64");
}

export type CashierLine = {
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type CashierResult = {
  reference: string;
  orderNo: string;
  cashierUrl: string;
  status: string;
};

export async function createCashierPayment(input: {
  reference: string;
  amountNaira: number;
  returnUrl: string;
  callbackUrl: string;
  customer: { name: string; email: string; phone: string };
  items: CashierLine[];
}): Promise<CashierResult> {
  const { merchantId, publicKey, base, configured } = config();
  if (!configured || !merchantId || !publicKey) {
    throw new Error("OPay is not configured on this server");
  }

  const body = {
    country: "NG",
    reference: input.reference,
    amount: { total: Math.round(input.amountNaira * 100), currency: "NGN" },
    returnUrl: input.returnUrl,
    callbackUrl: input.callbackUrl,
    cancelUrl: input.returnUrl,
    expireAt: 30,
    userInfo: {
      userName: input.customer.name,
      userEmail: input.customer.email,
      userMobile: input.customer.phone,
    },
    productList: input.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      description: i.description,
      price: Math.round(i.price * 100),
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
  };

  const res = await fetch(`${base}/api/v1/international/cashier/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publicKey}`,
      MerchantId: merchantId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!json || json.code !== "00000" || !json.data?.cashierUrl) {
    throw new Error(json?.message || `OPay rejected the payment (HTTP ${res.status})`);
  }
  return json.data as CashierResult;
}

/**
 * Authoritative payment state, straight from OPay.
 *
 * Callbacks are never trusted on their own: OPay does not publish a webhook
 * signature scheme on the Cashier docs, so the callback is treated purely as
 * a nudge to re-query this endpoint.
 */
export async function queryPaymentStatus(reference: string) {
  const { merchantId, secretKey, base, configured } = config();
  if (!configured || !merchantId || !secretKey) {
    throw new Error("OPay is not configured on this server");
  }

  const body = JSON.stringify({ country: "NG", reference });
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const res = await fetch(`${base}/api/v1/international/cashier/status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${signRequest(body, timestamp, secretKey)}`,
      MerchantId: merchantId,
      RequestTimestamp: timestamp,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!json || json.code !== "00000") {
    throw new Error(json?.message || `OPay status check failed (HTTP ${res.status})`);
  }
  return json.data as {
    reference: string;
    orderNo: string;
    status: "INITIAL" | "PENDING" | "SUCCESS" | "FAIL" | "CLOSE";
    amount?: { total: number; currency: string };
  };
}

/** Map OPay's payment states onto the house's order statuses. */
export function mapStatus(opayStatus: string) {
  switch (opayStatus) {
    case "SUCCESS":
      return { payment: "success", order: "paid" } as const;
    case "FAIL":
      return { payment: "failed", order: "cancelled" } as const;
    case "CLOSE":
      return { payment: "closed", order: "cancelled" } as const;
    case "PENDING":
      return { payment: "pending", order: "pending" } as const;
    default:
      return { payment: "initial", order: "pending" } as const;
  }
}
