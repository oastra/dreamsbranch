-- ============================================================
-- Shop orders — one row per completed Stripe Checkout session.
-- Written by the Stripe webhook (service role). Stripe stays the
-- system of record; this mirror powers the admin orders view.
-- ============================================================

create table if not exists shop_orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text unique not null,
  stripe_payment_intent text,
  status                text not null default 'paid',
  amount_total          numeric(12,2) not null default 0,
  currency              text not null default 'AUD',
  customer_email        text,
  customer_name         text,
  customer_phone        text,
  shipping_address      jsonb,
  line_items            jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now()
);

create index shop_orders_created_at_idx on shop_orders(created_at desc);

-- No public access: only the service-role admin client (which bypasses RLS)
-- reads/writes this table. RLS on with no policies = deny-all for anon and
-- authenticated roles.
alter table shop_orders enable row level security;
