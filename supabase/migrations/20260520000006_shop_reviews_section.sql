-- ============================================================
-- Per-section scoping for shop reviews.
-- NULL → review shows on every shop page (handmade, from_ukraine,
-- cuisine, catering) — current behaviour for existing rows.
-- Set → review shows only on the matching shop page.
-- ============================================================

alter table shop_reviews
  add column section shop_section;

create index shop_reviews_section_idx on shop_reviews(section);
