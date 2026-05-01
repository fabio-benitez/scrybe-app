
-- =========================
-- File upload status
-- =========================

create type file_upload_status as enum ('pending', 'uploaded', 'failed');

alter table files
add column upload_status file_upload_status not null default 'pending';

create index idx_files_pending
  on files(created_at)
  where upload_status = 'pending';