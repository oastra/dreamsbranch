-- "Who edited this?" audit columns for the main content tables.
--
-- Each table gains:
--   • created_by_admin_id — the admin who first inserted the row
--   • updated_by_admin_id — the admin who last modified it
--
-- Both reference admin_users(id) and `on delete set null` so removing an
-- admin account leaves historical attributions as NULL rather than
-- cascading-deleting their content. Existing rows stay NULL.

alter table campaigns      add column created_by_admin_id uuid references admin_users(id) on delete set null;
alter table campaigns      add column updated_by_admin_id uuid references admin_users(id) on delete set null;

alter table events         add column created_by_admin_id uuid references admin_users(id) on delete set null;
alter table events         add column updated_by_admin_id uuid references admin_users(id) on delete set null;

alter table news_articles  add column created_by_admin_id uuid references admin_users(id) on delete set null;
alter table news_articles  add column updated_by_admin_id uuid references admin_users(id) on delete set null;
