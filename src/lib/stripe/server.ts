import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(apiKey, {
  // Pin to a known API version so behaviour doesn't drift when Stripe updates
  // their default. Bump deliberately when upgrading.
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const DONATION_CURRENCY = "aud";

// Lazily ensure a single recurring-donation Product exists in the Stripe
// account. We tag it with metadata.role=donation_recurring so we can find it
// again on subsequent boots without storing the id in env vars.
let cachedProductId: string | null = null;

export async function getRecurringDonationProductId(): Promise<string> {
  if (cachedProductId) return cachedProductId;

  const existing = await stripe.products.search({
    query: "metadata['role']:'donation_recurring' AND active:'true'",
    limit: 1,
  });
  if (existing.data[0]) {
    cachedProductId = existing.data[0].id;
    return cachedProductId;
  }

  const created = await stripe.products.create({
    name: "Monthly donation",
    metadata: { role: "donation_recurring" },
  });
  cachedProductId = created.id;
  return cachedProductId;
}
