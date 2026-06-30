// Server-side PayPal REST client (Orders v2 + Subscriptions v1).
// Talks to the sandbox or live API depending on PAYPAL_ENV. All money flows
// re-price on the server — the browser only ever sends ids/quantities.

const PAYPAL_ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";

export const PAYPAL_BASE_URL =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const PAYPAL_CURRENCY = "AUD";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!clientId || !clientSecret) {
    throw new Error(
      "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not set",
    );
  }
  // Reuse the token until ~1 min before expiry.
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

type PaypalFetchInit = {
  method?: string;
  json?: unknown;
  headers?: Record<string, string>;
};

/** Authenticated PayPal REST call. Throws with PayPal's error message on non-2xx. */
export async function paypalFetch<T = unknown>(
  path: string,
  init: PaypalFetchInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message =
      data?.message ||
      data?.details?.[0]?.description ||
      `PayPal error ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

// ── Recurring-donation plan ──────────────────────────────────────────────
// PayPal subscriptions need a Catalog Product + Billing Plan. We provision
// one monthly plan; the per-donor amount is overridden at subscription
// creation. Set PAYPAL_DONATION_PLAN_ID once provisioned to avoid recreating
// it (otherwise it's created lazily and cached in memory).

let cachedPlanId: string | null = process.env.PAYPAL_DONATION_PLAN_ID || null;

export async function getRecurringDonationPlanId(): Promise<string> {
  if (cachedPlanId) return cachedPlanId;

  const product = await paypalFetch<{ id: string }>("/v1/catalogs/products", {
    method: "POST",
    json: {
      name: "Monthly donation",
      type: "SERVICE",
      category: "CHARITY",
    },
  });

  const plan = await paypalFetch<{ id: string }>("/v1/billing/plans", {
    method: "POST",
    json: {
      product_id: product.id,
      name: "Monthly donation",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = until cancelled
          pricing_scheme: {
            // Placeholder — overridden per subscription with the real amount.
            fixed_price: { value: "1.00", currency_code: PAYPAL_CURRENCY },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 1,
      },
    },
  });

  cachedPlanId = plan.id;
  return plan.id;
}
