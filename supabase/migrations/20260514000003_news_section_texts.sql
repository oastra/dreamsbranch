-- News articles get three additional plain-text fields per locale that
-- map to the four-section Figma article layout:
--
--   title        — existing column
--   lead_text    — 24px paragraph, sits between title and hero
--   cover_image  — full-width hero
--   post_hero_text — 24px paragraph, sits between hero and the flex row
--   body         — main 18px article copy, paired with body_image in
--                  a side-by-side flex row (existing column)
--   outro_text   — 24px paragraph, sits below the flex row, full width
--
-- All three new fields are nullable so existing rows keep rendering.

alter table news_articles
  add column if not exists lead_text_ua text,
  add column if not exists lead_text_en text,
  add column if not exists post_hero_text_ua text,
  add column if not exists post_hero_text_en text,
  add column if not exists outro_text_ua text,
  add column if not exists outro_text_en text;
