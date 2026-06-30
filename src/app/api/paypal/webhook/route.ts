import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { paypalFetch } from "@/lib/paypal/server";

// Needs the raw body to verify PayPal's signature.
export const runtime = "nodejs";

const webhookId = process.env.PAYPAL_WEBHOOK_ID;

export async function POST(req: NextRequest) {
  if (!webhookId) {
    return NextResponse.json(
      { error: "PAYPAL_WEBHOOK_ID not set" },
      { status: 500 },
    );
  }

  const raw = await req.text();
  let event: {
    event_type?: string;
    resource?: Record<string, unknown>;
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify the event really came from PayPal.
  try {
    const verify = await paypalFetch<{ verification_status: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        json: {
          transmission_id: req.headers.get("paypal-transmission-id"),
          transmission_time: req.headers.get("paypal-transmission-time"),
          cert_url: req.headers.get("paypal-cert-url"),
          auth_algo: req.headers.get("paypal-auth-algo"),
          transmission_sig: req.headers.get("paypal-transmission-sig"),
          webhook_id: webhookId,
          webhook_event: event,
        },
      },
    );
    if (verify.verification_status !== "SUCCESS") {
      return NextResponse.json({ error: "Bad signature" }, { status: 400 });
    }
  } catch (err) {
    console.error("paypal webhook verify failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const sb = createAdminClient();

  // Recurring-donation payments. One-time order captures are recorded by the
  // capture routes, so we only act on subscription sales here.
  if (event.event_type === "PAYMENT.SALE.COMPLETED") {
    const sale = (event.resource ?? {}) as {
      id?: string;
      billing_agreement_id?: string;
      amount?: { total?: string };
    };
    const subId = sale.billing_agreement_id;
    const saleId = sale.id;
    if (subId && saleId) {
      try {
        const sub = await paypalFetch<{
          custom_id?: string;
          subscriber?: { email_address?: string };
        }>(`/v1/billing/subscriptions/${subId}`);

        const [campaignId, anon, name] = (sub.custom_id ?? "").split(";");
        if (campaignId) {
          const { data: existing } = await sb
            .from("donations")
            .select("id")
            .eq("external_payment_id", saleId)
            .maybeSingle();
          if (!existing) {
            const isAnonymous = anon === "1";
            const insertRow: Record<string, unknown> = {
              campaign_id: campaignId,
              donor_name: isAnonymous ? "" : name ?? "",
              donor_email: sub.subscriber?.email_address ?? null,
              amount: Number(sale.amount?.total ?? 0),
              currency: "AUD",
              source: "paypal",
              status: "completed",
              is_anonymous: isAnonymous,
              external_payment_id: saleId,
            };
            await sb
              .from("donations")
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .insert(insertRow as any);
          }
        }
      } catch (err) {
        console.error("paypal subscription sale handling failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
