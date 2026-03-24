-- ============================================================
-- DreamsBranch Phase 1 — Database Migration
-- Generated from Figma designs + Blueprint v3
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type content_status as enum ('draft', 'active', 'archived');
create type article_status as enum ('draft', 'published');
create type report_status as enum ('draft', 'published');
create type donation_source as enum ('stripe', 'paypal', 'manual');
create type donation_status as enum ('pending', 'completed', 'failed', 'refunded');
create type contact_tag as enum ('general', 'catering', 'volunteer');
create type admin_role as enum ('super_admin', 'editor');

-- ============================================================
-- ADMIN USERS
-- Linked to Supabase Auth via id (auth.users.id)
-- ============================================================

create table admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  role        admin_role not null default 'editor',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- CAMPAIGNS
-- Screens: Campaign Detail Active + Archived
-- Fields observed: title, description, cover_image,
--   goal_amount, current_amount, progress bar, status badge,
--   gallery photos (archived report), FAQ tab, donor list,
--   preset donation amounts, social share, other campaigns carousel
-- ============================================================

create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,

  -- Bilingual content
  title_ua        text not null,
  title_en        text not null,
  description_ua  jsonb not null default '{}',   -- Tiptap rich text
  description_en  jsonb not null default '{}',

  -- FAQ tab (screen: "Популярні питання")
  faq_ua          jsonb not null default '[]',   -- [{question, answer}, ...]
  faq_en          jsonb not null default '[]',

  -- Media
  cover_image     text,                           -- Supabase Storage URL
  gallery_images  text[] not null default '{}',  -- Photo report (archived screen)

  -- Financials
  goal_amount     numeric(12,2) not null default 0,
  current_amount  numeric(12,2) not null default 0,  -- Updated by donation webhooks

  -- Donation preset amounts (screen: "$10 | $30 | $50 | ІНША")
  preset_amounts  integer[] not null default '{10,30,50}',

  -- Workflow
  status          content_status not null default 'draft',
  sort_order      integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index campaigns_status_idx on campaigns(status);
create index campaigns_slug_idx on campaigns(slug);

-- ============================================================
-- DONATIONS
-- Screen: Campaign Detail Active (right sidebar donor list)
-- Fields: donor name, amount, time ago, "Подивитись більше"
-- Sources: Stripe, PayPal, Manual (admin input)
-- ============================================================

create table donations (
  id                    uuid primary key default gen_random_uuid(),
  campaign_id           uuid not null references campaigns(id) on delete restrict,
  donor_name            text not null default 'Anonymous',
  donor_email           text,
  amount                numeric(12,2) not null,
  currency              text not null default 'AUD',
  source                donation_source not null,
  external_payment_id   text,                      -- Stripe/PayPal payment id
  status                donation_status not null default 'pending',
  is_anonymous          boolean not null default false,
  note                  text,                      -- Admin note for manual donations
  added_by_admin_id     uuid references admin_users(id) on delete set null,
  created_at            timestamptz not null default now()
);

create index donations_campaign_idx on donations(campaign_id);
create index donations_status_idx on donations(status);
create index donations_source_idx on donations(source);

-- Auto-update campaign.current_amount when a donation is completed
create or replace function update_campaign_amount()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT' and NEW.status = 'completed') or
     (TG_OP = 'UPDATE' and NEW.status = 'completed' and OLD.status != 'completed') then
    update campaigns
    set current_amount = (
      select coalesce(sum(amount), 0)
      from donations
      where campaign_id = NEW.campaign_id and status = 'completed'
    ),
    updated_at = now()
    where id = NEW.campaign_id;
  end if;
  return NEW;
end;
$$;

create trigger trg_update_campaign_amount
after insert or update on donations
for each row execute function update_campaign_amount();

-- ============================================================
-- EVENTS
-- Screens: Event Detail Active + Archived
-- Fields: title, cover_image, date/time, location, map_url,
--   rich text body, 3-column info blocks, tags (status badges),
--   volunteer CTA banner, gallery + financial report (archived)
-- ============================================================

create table events (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,

  -- Bilingual content
  title_ua            text not null,
  title_en            text not null,
  description_ua      jsonb not null default '{}',  -- Tiptap rich text (main body)
  description_en      jsonb not null default '{}',

  -- 3-column info blocks (screen: "Що буде | Хто може | Чому варто")
  -- [{title_ua, title_en, content_ua, content_en}, ...]
  info_blocks_ua      jsonb not null default '[]',
  info_blocks_en      jsonb not null default '[]',

  -- Media
  cover_image         text,
  gallery_images      text[] not null default '{}',  -- Archived event photo report

  -- Date & Location
  event_date          date not null,
  start_time          time not null,
  end_time            time,
  location            text not null,
  location_map_url    text,  -- Google Maps or similar

  -- Tags shown as badges (screen: "Потрібні партнери", "Шукаємо волонтерів")
  -- Values: 'looking_for_partners', 'looking_for_volunteers'
  tags                text[] not null default '{}',

  -- Volunteer CTA banner (active events screen)
  show_volunteer_cta  boolean not null default false,

  -- Financial report for archived events
  -- { income: [{label, amount}], expenses: [{label, amount}], profit, note }
  financial_report    jsonb,

  -- Workflow
  status              content_status not null default 'draft',
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index events_status_idx on events(status);
create index events_date_idx on events(event_date desc);
create index events_slug_idx on events(slug);

-- ============================================================
-- NEWS ARTICLES
-- Screen: Article Detail
-- Fields: title, date, breadcrumbs, cover_image, rich text body
--   with inline images, category tag, social share, related articles
-- ============================================================

create table news_articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,

  -- Bilingual content
  title_ua      text not null,
  title_en      text not null,
  body_ua       jsonb not null default '{}',  -- Tiptap rich text (with inline images)
  body_en       jsonb not null default '{}',

  -- Media
  cover_image   text,

  -- Categorisation (screen: "Новини" badge on cards)
  category      text not null default 'news',
  tags          text[] not null default '{}',
  is_featured   boolean not null default false,

  -- Workflow
  status        article_status not null default 'draft',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index news_status_idx on news_articles(status);
create index news_published_idx on news_articles(published_at desc);
create index news_featured_idx on news_articles(is_featured) where is_featured = true;
create index news_slug_idx on news_articles(slug);

-- ============================================================
-- REPORTS
-- Year-by-year transparency reports with photos + PDF
-- ============================================================

create table reports (
  id              uuid primary key default gen_random_uuid(),
  year            integer not null unique,

  -- Bilingual content
  title_ua        text not null,
  title_en        text not null,
  description_ua  text,
  description_en  text,

  -- Media
  cover_image     text,
  gallery_images  text[] not null default '{}',
  pdf_url         text,

  -- Workflow
  status          report_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index reports_year_idx on reports(year desc);

-- ============================================================
-- CONTACT SUBMISSIONS
-- Screen: Contact form block (appears on Article + Event pages)
-- Fields: Ім'я, Телефон, Email, Коментар
-- Tags: general | catering | volunteer
-- ============================================================

create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  email       text not null,
  message     text not null,
  tag         contact_tag not null default 'general',
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index contact_tag_idx on contact_submissions(tag);
create index contact_read_idx on contact_submissions(is_read) where is_read = false;

-- ============================================================
-- HOME PAGE SETTINGS (singleton row)
-- Editable via admin panel
-- ============================================================

create table home_page_settings (
  id                    integer primary key default 1,
  constraint single_row check (id = 1),

  -- Hero section
  hero_title_ua         text not null default '',
  hero_title_en         text not null default '',
  hero_subtitle_ua      text not null default '',
  hero_subtitle_en      text not null default '',
  hero_description_ua   text not null default '',
  hero_description_en   text not null default '',
  hero_video_url        text,
  hero_image_url        text,

  -- Stats bar
  stats_raised          numeric(14,2) not null default 0,
  stats_people          integer not null default 0,
  stats_campaigns       integer not null default 0,

  -- CTA block ("Support Our Activity")
  cta_title_ua          text not null default '',
  cta_title_en          text not null default '',
  cta_description_ua    text not null default '',
  cta_description_en    text not null default '',

  updated_at            timestamptz not null default now()
);

-- Insert the singleton row
insert into home_page_settings (id) values (1);

-- ============================================================
-- UPDATED_AT TRIGGERS (auto-update on all tables)
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger trg_campaigns_updated_at
  before update on campaigns
  for each row execute function set_updated_at();

create trigger trg_events_updated_at
  before update on events
  for each row execute function set_updated_at();

create trigger trg_news_updated_at
  before update on news_articles
  for each row execute function set_updated_at();

create trigger trg_reports_updated_at
  before update on reports
  for each row execute function set_updated_at();

create trigger trg_admin_users_updated_at
  before update on admin_users
  for each row execute function set_updated_at();

create trigger trg_home_settings_updated_at
  before update on home_page_settings
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Public: read published/active content only
-- Admin: full access via service role (bypasses RLS)
-- ============================================================

alter table campaigns           enable row level security;
alter table donations           enable row level security;
alter table events              enable row level security;
alter table news_articles       enable row level security;
alter table reports             enable row level security;
alter table contact_submissions enable row level security;
alter table home_page_settings  enable row level security;
alter table admin_users         enable row level security;

-- Public read policies
create policy "Public can view active campaigns"
  on campaigns for select using (status in ('active', 'archived'));

create policy "Public can view completed donations"
  on donations for select using (status = 'completed' and is_anonymous = false);

create policy "Public can view active events"
  on events for select using (status in ('active', 'archived'));

create policy "Public can view published articles"
  on news_articles for select using (status = 'published');

create policy "Public can view published reports"
  on reports for select using (status = 'published');

create policy "Public can read home settings"
  on home_page_settings for select using (true);

-- Public can submit contact forms
create policy "Public can submit contact forms"
  on contact_submissions for insert with check (true);

-- Admin users can read their own row
create policy "Admin can view own profile"
  on admin_users for select using (auth.uid() = id);
