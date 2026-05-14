-- News articles get a single in-text image that floats next to the body
-- copy on the article page (between the cover hero and the gallery grid).
-- Distinct from cover_image (hero, also used for listing thumbnails) and
-- gallery_images (multi-photo grid below the body).

alter table news_articles
  add column if not exists body_image text;
