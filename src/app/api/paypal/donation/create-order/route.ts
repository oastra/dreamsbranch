import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { paypalFetch, PAYPAL_CURRENCY } from "@/lib/paypal/server";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100_000;

const bodySchema = z.object({
  campaignSlug: z.string().min(1),
  amount: z.number().positive(),
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
  const { campaignSlug, amount } = parsed.data;
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
    const order = await paypalFetch<{ id: string }>("/v2/checkout/orders", {
      method: "POST",
      json: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: PAYPAL_CURRENCY,
              value: amount.toFixed(2),
            },
            // Carries the campaign through to capture (server-trusted).
            custom_id: campaign.id,
            description: "Donation",
          },
        ],
        application_context: { shipping_preference: "NO_SHIPPING" },
      },
    });
    return NextResponse.json({ id: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal request failed";
    console.error("paypal donation create-order failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
