
-- ===================================
-- File checksum and upload timestamp
-- ===================================

alter table files
add column checksum_sha256 text null,
add column uploaded_at timestamptz null;

alter table files
add constraint files_checksum_sha256_check
check (
  checksum_sha256 is null
  or checksum_sha256 ~ '^[a-f0-9]{64}$'
);

alter table files
add constraint files_uploaded_at_status_check
check (
  (upload_status = 'uploaded' and uploaded_at is not null)
  or
  (upload_status <> 'uploaded' and uploaded_at is null)
);

create unique index idx_files_user_checksum_uploaded
on files(user_id, checksum_sha256)
where upload_status = 'uploaded'
  and checksum_sha256 is not null;