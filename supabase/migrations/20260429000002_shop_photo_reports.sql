-- ============================================================
-- Shop Photo Reports
-- One row per "Last month thanks to your purchases we bought X".
-- The `images` JSONB array carries the collage of photos:
--   { url, kind: 'product'|'proof'|'chat', position: int,
--     caption_ua?: string, caption_en?: string }
-- ============================================================

create table shop_photo_reports (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,

  title_ua        text not null,
  title_en        text not null,
  report_date     date not null,

  images          jsonb not null default '[]',

  status          content_status not null default 'draft',
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index shop_photo_reports_status_idx
  on shop_photo_reports(status, sort_order, report_date desc);

create trigger set_shop_photo_reports_updated_at
  before update on shop_photo_reports
  for each row execute function set_updated_at();

alter table shop_photo_reports enable row level security;

create policy "Public can read active shop_photo_reports"
  on shop_photo_reports for select using (status = 'active');
