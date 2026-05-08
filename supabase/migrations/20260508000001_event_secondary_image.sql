-- Second image on events for the smaller, floated image inside the
-- description section. Existing pages that fall back to cover_image
-- keep working unchanged — the column is nullable and has no backfill.
alter table events add column secondary_image text;
