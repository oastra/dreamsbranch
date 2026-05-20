import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import {
  DONATION_CURRENCY,
  getRecurringDonationProductId,
  stripe,
} from "@/lib/stripe/server";

const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 10_000_000;

const bodySchema = z.object({
  campaignSlug: z.string().min(1),
  amount: z.number().positive(),
  email: z.string().email(),
  displayName: z.string().max(120).optional().default(""),
  cardholderName: z.string().max(120).optional().default(""),
  isAnonymous: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }
  const {
    campaignSlug,
    amount,
    email,
    displayName,
    cardholderName,
    isAnonymous,
  } = parsed.data;
  const donorName = isAnonymous ? "" : displayName.trim() || cardholderName.trim();

  const amountCents = Math.round(amount * 100);
  if (amountCents < MIN_AMOUNT_CENTS || amountCents > MAX_AMOUNT_CENTS) {
    return NextResponse.json(
      { error: "Amount out of range" },
      { status: 400 },
    );
  }

  const sb = createAdminClient();
  const { data: campaign } = await sb
    .from("campaigns")
    .select("id, slug, status")
    .or(
      `slug.eq.${campaignSlug},slug_ua.eq.${campaignSlug},slug_en.eq.${campaignSlug}`,
    )
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json(
      {
        error:
          campaignSlug === "general-fund"
            ? "General-fund campaign not configured. Create a campaigns row with slug='general-fund' and status='active'."
            : "Campaign not found",
      },
      { status: 404 },
    );
  }
  if (campaign.status !== "active") {
    return NextResponse.json(
      { error: "Campaign is not accepting donations" },
      { status: 400 },
    );
  }

  try {
  // Reuse Stripe Customer by email so a repeat donor doesn't accumulate dupes.
  const existingCustomers = await stripe.customers.list({ email, limit: 1 });
  const customer =
    existingCustomers.data[0] ??
    (await stripe.customers.create({
      email,
      name: isAnonymous ? undefined : displayName || undefined,
      metadata: { source: "donation_form" },
    }));

  const productId = await getRecurringDonationProductId();

  // We create the subscription with default_incomplete + payment_behavior so
  // we can finish payment client-side via the latest_invoice.payment_intent
  // client_secret. That's the only way to gather card details with Elements.
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price_data: {
          currency: DONATION_CURRENCY,
          product: productId,
          recurring: { interval: "month" },
          unit_amount: amountCents,
        },
      },
    ],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      campaign_id: campaign.id,
      campaign_slug: campaign.slug,
      donor_name: donorName,
      cardholder_name: cardholderName,
      donor_email: email,
      is_anonymous: String(isAnonymous),
      amount_aud: String(amount),
      source: "stripe",
    },
  });

  const latestInvoice = subscription.latest_invoice as
    | Stripe.Invoice
    | string
    | null;
  if (!latestInvoice || typeof latestInvoice === "string") {
    return NextResponse.json(
      { error: "Subscription created but no invoice attached" },
      { status: 500 },
    );
  }
  const intent = (latestInvoice as Stripe.Invoice & {
    payment_intent: Stripe.PaymentIntent | string | null;
  }).payment_intent;
  if (!intent || typeof intent === "string" || !intent.client_secret) {
    return NextResponse.json(
      { error: "No payment intent on subscription invoice" },
      { status: 500 },
    );
  }

  // The webhook (invoice.paid) writes the donation row once the charge clears.
  // We deliberately do NOT pre-insert a pending row here — duplicates with the
  // webhook would be hard to reconcile.

  return NextResponse.json({
    clientSecret: intent.client_secret,
    subscriptionId: subscription.id,
  });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe request failed";
    console.error("subscription failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
