import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

// Cap quantities so a tampered request can't create an absurd order.
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

  // Collapse duplicate slugs (the cart shouldn't send them, but be safe).
  const qtyBySlug = new Map<string, number>();
  for (const it of items) {
    qtyBySlug.set(it.slug, Math.min(MAX_QTY, (qtyBySlug.get(it.slug) ?? 0) + it.quantity));
  }
  const slugs = [...qtyBySlug.keys()];

  // Re-price from the DB — the client's prices are never trusted.
  const sb = createAdminClient();
  const { data: products, error } = await sb
    .from("shop_products")
    .select("slug, title_ua, title_en, price_amount, price_currency, cover_image")
    .in("slug", slugs);

  if (error) {
    return NextResponse.json({ error: "Could not load products" }, { status: 500 });
  }
  if (!products || products.length === 0) {
    return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
  }

  // Stripe Checkout takes a single currency per session — enforce it.
  const currency = (products[0].price_currency || "AUD").toLowerCase();
  if (products.some((p) => (p.price_currency || "AUD").toLowerCase() !== currency)) {
    return NextResponse.json(
      { error: "All items in an order must share one currency" },
      { status: 400 },
    );
  }

  const lineItems = products.map((p) => {
    const name = locale === "ua" ? p.title_ua : p.title_en;
    return {
      quantity: qtyBySlug.get(p.slug) ?? 1,
      price_data: {
        currency,
        unit_amount: Math.round(Number(p.price_amount) * 100),
        product_data: {
          name: name || p.title_en || p.title_ua || p.slug,
          images: p.cover_image ? [p.cover_image] : undefined,
          metadata: { slug: p.slug },
        },
      },
    };
  });

  const origin = req.nextUrl.origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      // Hosted Checkout collects card / Apple Pay / Google Pay automatically.
      shipping_address_collection: { allowed_countries: ["AU"] },
      phone_number_collection: { enabled: true },
      success_url: `${origin}/${locale}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/shop/cart`,
      metadata: { source: "shop" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe request failed";
    console.error("shop-checkout failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
