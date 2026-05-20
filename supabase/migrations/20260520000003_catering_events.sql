-- ============================================================
-- Catering events — admin-editable carousel content rendered on
-- /shop/catering ("Як виглядають наші заходи"). Each event is one
-- slide: bilingual title/description/location + a fixed-length
-- array of 5 image URLs (count enforced in the app layer).
-- ============================================================

create table catering_events (
  id                       uuid primary key default gen_random_uuid(),

  title_ua                 text not null default '',
  title_en                 text not null default '',
  description_ua           text not null default '',
  description_en           text not null default '',
  location_ua              text not null default '',
  location_en              text not null default '',

  images                   text[] not null default '{}',
  sort_order               integer not null default 0,

  created_by_admin_id      uuid references admin_users(id) on delete set null,
  updated_by_admin_id      uuid references admin_users(id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index catering_events_sort_idx on catering_events(sort_order, created_at desc);

create trigger set_catering_events_updated_at
  before update on catering_events
  for each row execute function set_updated_at();

alter table catering_events enable row level security;

create policy "Public can read catering_events"
  on catering_events for select using (true);
