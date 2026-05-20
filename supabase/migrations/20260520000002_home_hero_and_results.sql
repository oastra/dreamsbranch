-- ============================================================
-- Move Results values + hero carousel onto home_page_settings.
-- The four result strings used to live on about_page_settings;
-- they're now edited from /admin/home-settings since both Home
-- and About pages display the same numbers.
-- ============================================================

alter table home_page_settings
  add column if not exists hero_images        text[] not null default '{}',
  add column if not exists years_value        text   not null default '',
  add column if not exists members_value      text   not null default '',
  add column if not exists raised_value       text   not null default '',
  add column if not exists transparency_value text   not null default '';

-- Carry existing About values over so nothing flips to empty on deploy.
update home_page_settings hs
   set years_value        = aps.years_value,
       members_value      = aps.members_value,
       raised_value       = aps.raised_value,
       transparency_value = aps.transparency_value
  from about_page_settings aps
 where hs.id = 1 and aps.id = 1;

alter table about_page_settings
  drop column if exists years_value,
  drop column if exists members_value,
  drop column if exists raised_value,
  drop column if exists transparency_value;
