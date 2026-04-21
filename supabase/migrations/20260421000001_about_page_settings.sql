-- ============================================================
-- About Page Settings (singleton row id = 1)
-- ============================================================

create table about_page_settings (
  id                       integer primary key default 1,
  constraint about_single_row check (id = 1),

  -- Hero carousel: array of image URLs (min 4 enforced in app layer)
  hero_images              text[] not null default '{}',

  -- Team / full-width carousel: array of image URLs (min 4 enforced in app layer)
  team_images              text[] not null default '{}',

  -- Results section — 4 numeric value strings (labels stay in i18n)
  years_value              text not null default '',
  members_value            text not null default '',
  raised_value             text not null default '',
  transparency_value       text not null default '',

  -- FAQ: jsonb array of { q_ua, a_ua, q_en, a_en }
  faq_items                jsonb not null default '[]',

  updated_at               timestamptz not null default now()
);

insert into about_page_settings (id) values (1);

create trigger set_about_page_settings_updated_at
  before update on about_page_settings
  for each row execute function set_updated_at();

alter table about_page_settings enable row level security;

create policy "Public can read about_page_settings"
  on about_page_settings for select using (true);
