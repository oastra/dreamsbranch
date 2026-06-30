import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import {
  paypalFetch,
  PAYPAL_CURRENCY,
  getRecurringDonationPlanId,
} from "@/lib/paypal/server";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100_000;

const bodySchema = z.object({
  campaignSlug: z.string().min(1),
  amount: z.number().positive(),
  email: z.string().email(),
  displayName: z.string().max(120).optional().default(""),
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
  const { campaignSlug, amount, email, displayName, isAnonymous } = parsed.data;
  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return NextResponse.json({ error: "Amount out of range" }, { status: 400 });
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
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  if (campaign.status !== "active") {
    return NextResponse.json(
      { error: "Campaign is not accepting donations" },
      { status: 400 },
    );
  }

  try {
    const planId = await getRecurringDonationPlanId();

    // The webhook reads this back to attribute each recurring payment.
    // Format: "<campaignId>;<0|1 anonymous>;<public name>" (≤127 chars).
    const donorName = isAnonymous ? "" : displayName.trim();
    const customId = `${campaign.id};${isAnonymous ? "1" : "0"};${donorName}`.slice(
      0,
      127,
    );

    const subscription = await paypalFetch<{ id: string }>(
      "/v1/billing/subscriptions",
      {
        method: "POST",
        json: {
          plan_id: planId,
          custom_id: customId,
          subscriber: { email_address: email },
          // Override the plan's placeholder price with the donor's amount.
          plan: {
            billing_cycles: [
              {
                sequence: 1,
                tenure_type: "REGULAR",
                total_cycles: 0,
                pricing_scheme: {
                  fixed_price: {
                    value: amount.toFixed(2),
                    currency_code: PAYPAL_CURRENCY,
                  },
                },
              },
            ],
          },
          application_context: {
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
          },
        },
      },
    );

    return NextResponse.json({ id: subscription.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal request failed";
    console.error("paypal create-subscription failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
