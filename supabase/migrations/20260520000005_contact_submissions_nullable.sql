-- ============================================================
-- Allow quick-lead submissions (e.g. the catering CTA: name + phone
-- only) to flow into the same contact_submissions inbox without
-- synthesising placeholder email/message values.
-- ============================================================

alter table contact_submissions alter column email   drop not null;
alter table contact_submissions alter column message drop not null;
