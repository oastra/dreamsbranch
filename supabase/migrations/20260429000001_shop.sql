-- ============================================================
-- Shop: categories + products
-- Sections (handmade / from_ukraine / cuisine / catering) are
-- stored as a `shop_section` enum on each product and category.
-- Categories are the filter pills inside a section.
-- ============================================================

create type shop_section as enum (
  'handmade',
  'from_ukraine',
  'cuisine',
  'catering'
);

create table shop_categories (
  id          uuid primary key default gen_random_uuid(),
  section     shop_section not null,
  slug        text not null,
  name_ua     text not null,
  name_en     text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (section, slug)
);

create index shop_categories_section_idx on shop_categories(section, sort_order);

create trigger set_shop_categories_updated_at
  before update on shop_categories
  for each row execute function set_updated_at();

create table shop_products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  section         shop_section not null,
  category_id     uuid references shop_categories(id) on delete set null,

  title_ua        text not null,
  title_en        text not null,
  description_ua  text,
  description_en  text,

  price_amount    numeric(10,2) not null default 0,
  price_currency  text not null default 'AUD',

  cover_image     text,
  gallery_images  text[] not null default '{}',

  status          content_status not null default 'draft',
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index shop_products_section_status_idx
  on shop_products(section, status, sort_order);

create index shop_products_category_idx
  on shop_products(category_id);

create trigger set_shop_products_updated_at
  before update on shop_products
  for each row execute function set_updated_at();

alter table shop_categories enable row level security;
alter table shop_products   enable row level security;

create policy "Public can read shop_categories"
  on shop_categories for select using (true);

create policy "Public can read active shop_products"
  on shop_products for select using (status = 'active');
