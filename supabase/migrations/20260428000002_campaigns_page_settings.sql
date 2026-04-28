-- ============================================================
-- Campaigns Page Settings (singleton row id = 1)
-- ============================================================

create table campaigns_page_settings (
  id                       integer primary key default 1,
  constraint campaigns_single_row check (id = 1),

  -- Hero carousel: array of image URLs (min 1 enforced in app layer)
  hero_images              text[] not null default '{}',

  -- "Recently delivered" cards: jsonb array of
  -- { count: number, image: string, label_ua: string, label_en: string }
  delivered_items          jsonb not null default '[]',

  updated_at               timestamptz not null default now()
);

insert into campaigns_page_settings (id) values (1);

create trigger set_campaigns_page_settings_updated_at
  before update on campaigns_page_settings
  for each row execute function set_updated_at();

alter table campaigns_page_settings enable row level security;

create policy "Public can read campaigns_page_settings"
  on campaigns_page_settings for select using (true);
