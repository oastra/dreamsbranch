import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

// Stripe needs the raw body to verify the signature. App Router gives us that
// via req.text() (NOT req.json()) — parsing first would invalidate the HMAC.
export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const sb = createAdminClient();

  switch (event.type) {
    // ── One-time card donations ─────────────────────────────────────────
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      // Subscriptions also produce payment_intent.succeeded events, but their
      // donation row is written by invoice.paid below — so we only touch
      // pre-existing pending rows (one-time flow).
      await sb
        .from("donations")
        .update({ status: "completed" })
        .eq("external_payment_id", pi.id)
        .eq("status", "pending");
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await sb
        .from("donations")
        .update({ status: "failed" })
        .eq("external_payment_id", pi.id);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        await sb
          .from("donations")
          .update({ status: "refunded" })
          .eq("external_payment_id", String(charge.payment_intent));
      }
      break;
    }

    // ── Recurring (subscription) donations ──────────────────────────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      }).subscription;
      if (!subscriptionId) break;

      // Pull metadata from the parent subscription (the invoice itself doesn't
      // carry our metadata).
      const subId =
        typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;
      const subscription = await stripe.subscriptions.retrieve(subId);
      const meta = subscription.metadata;
      const campaignId = meta.campaign_id;
      if (!campaignId) break;

      const amountAud = Number(meta.amount_aud);
      const isAnonymous = meta.is_anonymous === "true";

      // Idempotency: invoice.paid can fire more than once. Skip if we've
      // already recorded this invoice.
      const { data: existing } = await sb
        .from("donations")
        .select("id")
        .eq("external_payment_id", invoice.id)
        .maybeSingle();
      if (existing) break;

      const subInsertRow: Record<string, unknown> = {
        campaign_id: campaignId,
        donor_name: isAnonymous ? "" : meta.donor_name ?? "",
        cardholder_name: meta.cardholder_name || null,
        donor_email: meta.donor_email ?? null,
        amount: Number.isFinite(amountAud)
          ? amountAud
          : (invoice.amount_paid ?? 0) / 100,
        currency: "AUD",
        source: "stripe",
        status: "completed",
        is_anonymous: isAnonymous,
        external_payment_id: invoice.id,
      };
      await sb
        .from("donations")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(subInsertRow as any);
      break;
    }
    case "invoice.payment_failed": {
      // We don't pre-insert pending rows for subscriptions, so there's nothing
      // to update — log only. (Could insert a failed row here later for ops
      // visibility.)
      break;
    }
    case "customer.subscription.deleted": {
      // No DB action needed today; donations stay attributed to the campaign.
      break;
    }

    // ── Shop orders (hosted Checkout) ───────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.source !== "shop") break;

      // Line items aren't included on the session object — fetch them.
      let lineItems: Array<{
        description: string | null;
        quantity: number | null;
        amount_total: number;
        currency: string;
      }> = [];
      try {
        const li = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
        });
        lineItems = li.data.map((row) => ({
          description: row.description,
          quantity: row.quantity,
          amount_total: row.amount_total,
          currency: row.currency,
        }));
      } catch (err) {
        console.error("listLineItems failed for", session.id, err);
      }

      const pi =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      // `shipping_details` isn't on the pinned API version's type — read it
      // defensively and fall back to the billing address.
      const sessionAny = session as unknown as {
        shipping_details?: { address?: unknown } | null;
      };
      const shippingAddress =
        sessionAny.shipping_details?.address ??
        session.customer_details?.address ??
        null;

      const orderRow = {
        stripe_session_id: session.id,
        stripe_payment_intent: pi,
        status: "paid",
        amount_total: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "aud").toUpperCase(),
        customer_email: session.customer_details?.email ?? null,
        customer_name: session.customer_details?.name ?? null,
        customer_phone: session.customer_details?.phone ?? null,
        shipping_address: shippingAddress,
        line_items: lineItems,
      };

      // Idempotent: checkout.session.completed can fire more than once.
      // `shop_orders` isn't in the generated types yet (added via migration).
      await (sb as unknown as {
        from: (t: string) => {
          upsert: (
            row: unknown,
            opts: { onConflict: string; ignoreDuplicates: boolean },
          ) => Promise<unknown>;
        };
      })
        .from("shop_orders")
        .upsert(orderRow, {
          onConflict: "stripe_session_id",
          ignoreDuplicates: true,
        });
      break;
    }

    default:
      // Ignore unrelated events so Stripe keeps marking deliveries as 2xx.
      break;
  }

  return NextResponse.json({ received: true });
}
