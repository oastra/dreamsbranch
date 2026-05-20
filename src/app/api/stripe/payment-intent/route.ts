import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { DONATION_CURRENCY, stripe } from "@/lib/stripe/server";

// Server-side bounds. The form already clamps client-side, but Stripe sees
// whatever the browser sends — so we re-clamp here.
const MIN_AMOUNT_CENTS = 100; // $1.00
const MAX_AMOUNT_CENTS = 10_000_000; // $100,000.00

const bodySchema = z.object({
  campaignSlug: z.string().min(1),
  amount: z.number().positive(),
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
  const { campaignSlug, amount, displayName, cardholderName, isAnonymous } =
    parsed.data;
  // Public donor_name on the campaign list: the donor's typed display name,
  // or the cardholder name if they left it blank, or empty for anonymous.
  const donorName = isAnonymous ? "" : displayName.trim() || cardholderName.trim();

  const amountCents = Math.round(amount * 100);
  if (amountCents < MIN_AMOUNT_CENTS || amountCents > MAX_AMOUNT_CENTS) {
    return NextResponse.json(
      { error: "Amount out of range" },
      { status: 400 },
    );
  }

  // Resolve campaign by slug (either locale). Stripe metadata gets the slug
  // string; donations.campaign_id gets the resolved UUID.
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
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: DONATION_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        campaign_id: campaign.id,
        campaign_slug: campaignSlug,
        donor_name: donorName,
        cardholder_name: cardholderName,
        is_anonymous: String(isAnonymous),
        source: "stripe",
      },
    });

    // Insert a pending donation row. The webhook flips it to completed once
    // Stripe confirms — we never trust the client to report success.
    // `cardholder_name` is a manually-added column not yet in the generated
    // Supabase types — regenerate via `npm run types:db` to type it cleanly.
    const insertRow: Record<string, unknown> = {
      campaign_id: campaign.id,
      donor_name: donorName,
      cardholder_name: cardholderName || null,
      amount,
      currency: "AUD",
      source: "stripe",
      status: "pending",
      is_anonymous: isAnonymous,
      external_payment_id: intent.id,
    };
    await sb
      .from("donations")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertRow as any);

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe request failed";
    console.error("payment-intent failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
