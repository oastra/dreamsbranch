import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { paypalFetch } from "@/lib/paypal/server";

const bodySchema = z.object({
  orderId: z.string().min(1),
  displayName: z.string().max(120).optional().default(""),
  isAnonymous: z.boolean().optional().default(false),
});

type Capture = {
  id: string;
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        custom_id?: string;
        amount?: { value?: string; currency_code?: string };
      }>;
    };
  }>;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { orderId, displayName, isAnonymous } = parsed.data;

  try {
    const capture = await paypalFetch<Capture>(
      `/v2/checkout/orders/${orderId}/capture`,
      { method: "POST", json: {} },
    );
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed (${capture.status})` },
        { status: 402 },
      );
    }

    const unit = capture.purchase_units?.[0];
    const cap = unit?.payments?.captures?.[0];
    // Campaign id came back trusted from the order we created.
    const campaignId = unit?.custom_id ?? cap?.custom_id ?? null;
    if (!campaignId) {
      return NextResponse.json(
        { error: "Order missing campaign reference" },
        { status: 400 },
      );
    }

    const sb = createAdminClient();
    // Idempotency: onApprove + webhook could both fire.
    const { data: existing } = await sb
      .from("donations")
      .select("id")
      .eq("external_payment_id", cap?.id ?? orderId)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true });

    const donorName = isAnonymous ? "" : displayName.trim();
    const insertRow: Record<string, unknown> = {
      campaign_id: campaignId,
      donor_name: donorName,
      amount: Number(cap?.amount?.value ?? 0),
      currency: (cap?.amount?.currency_code ?? "AUD").toUpperCase(),
      source: "paypal",
      status: "completed",
      is_anonymous: isAnonymous,
      external_payment_id: cap?.id ?? orderId,
    };
    await sb
      .from("donations")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertRow as any);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal capture failed";
    console.error("paypal donation capture-order failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
