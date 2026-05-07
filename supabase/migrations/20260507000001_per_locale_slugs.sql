-- Per-locale slugs for public, SEO-critical entities.
--
-- Each affected table gains slug_ua and slug_en columns. The legacy
-- `slug` column is kept (made nullable) so the public routes can fall
-- back to it when an old inbound URL still uses the pre-migration slug,
-- and 301-redirect the visitor to the canonical locale-specific URL.

-- ─── events ──────────────────────────────────────────────────────────
alter table events add column slug_ua text;
alter table events add column slug_en text;
update events set slug_ua = slug, slug_en = slug where slug_ua is null;
alter table events alter column slug_ua set not null;
alter table events alter column slug_en set not null;
create unique index events_slug_ua_idx on events(slug_ua);
create unique index events_slug_en_idx on events(slug_en);
alter table events alter column slug drop not null;

-- ─── campaigns ───────────────────────────────────────────────────────
alter table campaigns add column slug_ua text;
alter table campaigns add column slug_en text;
update campaigns set slug_ua = slug, slug_en = slug where slug_ua is null;
alter table campaigns alter column slug_ua set not null;
alter table campaigns alter column slug_en set not null;
create unique index campaigns_slug_ua_idx on campaigns(slug_ua);
create unique index campaigns_slug_en_idx on campaigns(slug_en);
alter table campaigns alter column slug drop not null;

-- ─── news_articles ───────────────────────────────────────────────────
alter table news_articles add column slug_ua text;
alter table news_articles add column slug_en text;
update news_articles set slug_ua = slug, slug_en = slug where slug_ua is null;
alter table news_articles alter column slug_ua set not null;
alter table news_articles alter column slug_en set not null;
create unique index news_articles_slug_ua_idx on news_articles(slug_ua);
create unique index news_articles_slug_en_idx on news_articles(slug_en);
alter table news_articles alter column slug drop not null;

-- ─── shop_products ───────────────────────────────────────────────────
alter table shop_products add column slug_ua text;
alter table shop_products add column slug_en text;
update shop_products set slug_ua = slug, slug_en = slug where slug_ua is null;
alter table shop_products alter column slug_ua set not null;
alter table shop_products alter column slug_en set not null;
create unique index shop_products_slug_ua_idx on shop_products(slug_ua);
create unique index shop_products_slug_en_idx on shop_products(slug_en);
alter table shop_products alter column slug drop not null;
