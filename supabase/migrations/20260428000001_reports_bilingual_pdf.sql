-- Split reports.pdf_url into bilingual columns: pdf_url_ua + pdf_url_en
alter table reports
  add column if not exists pdf_url_ua text,
  add column if not exists pdf_url_en text;

-- Backfill: any existing pdf_url becomes the UA one
update reports set pdf_url_ua = pdf_url where pdf_url is not null and pdf_url_ua is null;

-- Drop the old single column
alter table reports drop column if exists pdf_url;
