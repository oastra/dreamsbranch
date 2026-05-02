-- Add bilingual short description fields used as the hero subtitle on
-- the campaign detail page. Optional — falls back to empty string in UI.
alter table campaigns
  add column if not exists short_description_ua text,
  add column if not exists short_description_en text;
