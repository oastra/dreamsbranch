import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { paypalFetch } from "@/lib/paypal/server";

const MAX_QTY = 99;
const MAX_LINES = 50;

const bodySchema = z.object({
  locale: z.enum(["ua", "en"]).default("en"),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().positive().max(MAX_QTY),
      }),
    )
    .min(1)
    .max(MAX_LINES),
});

const money = (n: number) => n.toFixed(2);

type ProductRow = {
  slug: string;
  title_ua: string;
  title_en: string;
  price_amount: number;
  price_currency: string;
  stock: number | null;
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }
  const { locale, items } = parsed.data;

  const qtyBySlug = new Map<string, number>();
  for (const it of items) {
    qtyBySlug.set(
      it.slug,
      Math.min(MAX_QTY, (qtyBySlug.get(it.slug) ?? 0) + it.quantity),
    );
  }

  // Re-price from the DB — never trust the client's prices. `stock` isn't in
  // the generated types yet (added via migration) — cast the query.
  const sb = createAdminClient();
  const { data: products, error } = await (
    sb.from("shop_products") as unknown as {
      select: (c: string) => {
        in: (
          col: string,
          vals: string[],
        ) => Promise<{ data: ProductRow[] | null; error: { message?: string } | null }>;
      };
    }
  )
    .select("slug, title_ua, title_en, price_amount, price_currency, stock")
    .in("slug", [...qtyBySlug.keys()]);

  if (error) {
    return NextResponse.json({ error: "Could not load products" }, { status: 500 });
  }
  if (!products || products.length === 0) {
    return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
  }

  // Stock check — reject before the buyer approves if anything is short.
  for (const p of products) {
    const want = qtyBySlug.get(p.slug) ?? 0;
    const have = (p as { stock?: number | null }).stock;
    if (have != null && want > have) {
      const name = (locale === "ua" ? p.title_ua : p.title_en) || p.slug;
      return NextResponse.json(
        { error: have === 0 ? `"${name}" is out of stock` : `Only ${have} of "${name}" left` },
        { status: 409 },
      );
    }
  }

  const currency = (products[0].price_currency || "AUD").toUpperCase();
  if (products.some((p) => (p.price_currency || "AUD").toUpperCase() !== currency)) {
    return NextResponse.json(
      { error: "All items in an order must share one currency" },
      { status: 400 },
    );
  }

  let itemTotal = 0;
  const ppItems = products.map((p) => {
    const qty = qtyBySlug.get(p.slug) ?? 1;
    const unit = Number(p.price_amount);
    itemTotal += unit * qty;
    return {
      name: (locale === "ua" ? p.title_ua : p.title_en) || p.slug,
      quantity: String(qty),
      unit_amount: { currency_code: currency, value: money(unit) },
    };
  });

  try {
    const order = await paypalFetch<{ id: string }>("/v2/checkout/orders", {
      method: "POST",
      json: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: money(itemTotal),
              breakdown: {
                item_total: { currency_code: currency, value: money(itemTotal) },
              },
            },
            items: ppItems,
            // Carries the line items through to capture for stock decrement.
            custom_id: [...qtyBySlug.entries()]
              .map(([s, q]) => `${s}:${q}`)
              .join(",")
              .slice(0, 127),
          },
        ],
        // Buyer fills shipping on PayPal's side.
      },
    });
    return NextResponse.json({ id: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal request failed";
    console.error("paypal create-order failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
