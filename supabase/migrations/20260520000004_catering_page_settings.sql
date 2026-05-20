-- ============================================================
-- Catering page settings (singleton row id = 1)
-- For now this only stores the FAQ block shown on /shop/catering.
-- Same shape as about_page_settings.faq_items so the admin UI can
-- reuse the existing FaqItem editor pattern.
-- ============================================================

create table catering_page_settings (
  id            integer primary key default 1,
  constraint catering_single_row check (id = 1),

  -- jsonb array of { q_ua, a_ua, q_en, a_en }
  faq_items     jsonb not null default '[]',

  updated_at    timestamptz not null default now()
);

insert into catering_page_settings (id) values (1);

create trigger set_catering_page_settings_updated_at
  before update on catering_page_settings
  for each row execute function set_updated_at();

alter table catering_page_settings enable row level security;

create policy "Public can read catering_page_settings"
  on catering_page_settings for select using (true);
