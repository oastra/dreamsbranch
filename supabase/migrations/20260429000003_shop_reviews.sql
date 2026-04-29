-- ============================================================
-- Shop Reviews
-- Customer testimonials shown on shop catalog pages
-- (`Відгуки наших благодійників` carousel).
-- Bilingual: name/role/quote each have _ua and _en columns.
-- ============================================================

create table shop_reviews (
  id              uuid primary key default gen_random_uuid(),

  name_ua         text not null,
  name_en         text not null,
  role_ua         text,
  role_en         text,
  quote_ua        text not null,
  quote_en        text not null,

  rating          smallint not null default 5
                    check (rating between 1 and 5),

  avatar          text,

  status          content_status not null default 'draft',
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index shop_reviews_status_idx
  on shop_reviews(status, sort_order, created_at desc);

create trigger set_shop_reviews_updated_at
  before update on shop_reviews
  for each row execute function set_updated_at();

alter table shop_reviews enable row level security;

create policy "Public can read active shop_reviews"
  on shop_reviews for select using (status = 'active');
