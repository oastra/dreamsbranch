-- Rename events.secondary_image → events.hero_image.
--
-- The column was originally called "secondary_image" to mean the smaller
-- floated image next to the description. The project's design has since
-- flipped: `cover_image` is now the small floated image, and this column
-- holds the big hero banner at the top of the event page. Rename to
-- reflect that.
--
-- `if exists` guards the rename so re-runs don't blow up.
alter table events rename column secondary_image to hero_image;
