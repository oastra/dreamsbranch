-- ============================================================
-- Image Alt Text
-- One central table for AI-generated bilingual alt text + captions,
-- keyed by the image URL. Images live as bare URL strings (cover_image)
-- or string arrays (gallery_images, hero_images, images) scattered across
-- ~15 columns; this table gives every URL one place to hold its alt text
-- instead of adding an alt column beside each image column.
--
-- Two write paths, one table:
--   • Batch agent  -> writes status='pending' -> reviewed in an admin queue
--   • Inline (later) -> human reviews in the upload form -> writes 'approved'
--
--   alt_ua / alt_en     — short screen-reader alt (~125 char soft ceiling)
--   caption_ua / _en    — richer description (longer SEO-outside-alt text)
--   status              — 'pending' | 'approved' (the human-approval gate)
-- ============================================================

create table image_alt_text (
  url             text primary key,

  alt_ua          text,
  alt_en          text,
  caption_ua      text,
  caption_en      text,

  status          text not null default 'pending',

  created_by_admin_id uuid references admin_users(id) on delete set null,
  updated_by_admin_id uuid references admin_users(id) on delete set null,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index image_alt_text_status_idx on image_alt_text(status);

create trigger set_image_alt_text_updated_at
  before update on image_alt_text
  for each row execute function set_updated_at();

alter table image_alt_text enable row level security;

-- Public site (anon client, respects RLS) only ever sees approved alt text.
-- The admin batch agent + review queue use the service-role client, which
-- bypasses RLS, so they can read/write 'pending' rows.
create policy "Public can read approved image_alt_text"
  on image_alt_text for select using (status = 'approved');
