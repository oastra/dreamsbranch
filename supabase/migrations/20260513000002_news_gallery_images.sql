-- News articles get a gallery_images column so the body can be text-only
-- rich text and photos are managed via the existing MultiImageUpload pattern
-- (mirrors campaigns / events / reports / shop_products).

alter table news_articles
  add column if not exists gallery_images text[] not null default '{}';
