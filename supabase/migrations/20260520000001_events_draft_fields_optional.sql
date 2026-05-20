-- Two-tier validation: DRAFT events can be saved with only a title.
-- The fields below were originally NOT NULL but are now enforced
-- at the app layer (validations.ts → superRefine) only when the event
-- leaves DRAFT. Relax the DB constraints so drafts can persist
-- before the editor has gathered date/time/location.

alter table events alter column event_date drop not null;
alter table events alter column start_time drop not null;
alter table events alter column location   drop not null;
