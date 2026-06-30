-- ============================================================
-- Shop orders — one row per completed checkout (Stripe or PayPal).
-- Written by the payment webhooks / capture routes (service role).
-- The provider stays the system of record; this mirror powers the
-- admin orders view.
-- ============================================================

create table if not exists shop_orders (
  id                    uuid primary key default gen_random_uuid(),
  provider              text not null default 'stripe', -- 'stripe' | 'paypal'
  external_id           text unique not null,           -- Stripe session id / PayPal order id
  external_payment_id   text,                           -- Stripe PI / PayPal capture id
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
