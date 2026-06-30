-- ============================================================
-- Optional per-product stock tracking.
--   stock IS NULL  → untracked (unlimited)
--   stock = 0      → out of stock
--   stock > 0      → that many available
-- Decremented atomically when an order is paid (clamped at 0 so it can
-- never go negative). Untracked products are left alone.
-- ============================================================

alter table shop_products
  add column if not exists stock integer;

create or replace function decrement_shop_stock(p_slug text, p_qty integer)
returns void
language sql
as $$
  update shop_products
  set stock = greatest(stock - p_qty, 0)
  where slug = p_slug and stock is not null;
$$;
