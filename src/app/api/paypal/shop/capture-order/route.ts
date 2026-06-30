import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { paypalFetch } from "@/lib/paypal/server";

const bodySchema = z.object({ orderId: z.string().min(1) });

// Minimal shape of the PayPal capture response we read from.
type Capture = {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
    phone?: { phone_number?: { national_number?: string } };
  };
  purchase_units?: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        amount?: { value?: string; currency_code?: string };
      }>;
    };
    shipping?: { address?: unknown };
    items?: Array<{ name?: string; quantity?: string }>;
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
  const { orderId } = parsed.data;

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
    const name = [capture.payer?.name?.given_name, capture.payer?.name?.surname]
      .filter(Boolean)
      .join(" ");

    const orderRow = {
      provider: "paypal",
      external_id: capture.id,
      external_payment_id: cap?.id ?? null,
      status: "paid",
      amount_total: Number(cap?.amount?.value ?? 0),
      currency: (cap?.amount?.currency_code ?? "AUD").toUpperCase(),
      customer_email: capture.payer?.email_address ?? null,
      customer_name: name || null,
      customer_phone:
        capture.payer?.phone?.phone_number?.national_number ?? null,
      shipping_address: unit?.shipping?.address ?? null,
      line_items: (unit?.items ?? []).map((i) => ({
        description: i.name ?? null,
        quantity: Number(i.quantity ?? 1),
      })),
    };

    // `shop_orders` / the RPC aren't in the generated types yet — cast.
    const sb = createAdminClient();
    const sbx = sb as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (
            col: string,
            v: string,
          ) => { maybeSingle: () => Promise<{ data: { id: string } | null }> };
        };
        insert: (row: unknown) => Promise<unknown>;
      };
      rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
    };

    // Idempotent: only persist + decrement stock the first time.
    const { data: existingOrder } = await sbx
      .from("shop_orders")
      .select("id")
      .eq("external_id", capture.id)
      .maybeSingle();
    if (existingOrder) return NextResponse.json({ ok: true });

    await sbx.from("shop_orders").insert(orderRow);

    // Decrement stock from the items we stored in custom_id at create time.
    const itemsMeta = unit?.custom_id ?? "";
    for (const part of itemsMeta.split(",").filter(Boolean)) {
      const [s, qtyStr] = part.split(":");
      const qty = Number(qtyStr);
      if (s && qty > 0) {
        await sbx.rpc("decrement_shop_stock", { p_slug: s, p_qty: qty });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal capture failed";
    console.error("paypal capture-order failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
