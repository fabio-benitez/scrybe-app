-- Index for listing tags by authenticated user.
create index idx_tags_user_id on tags(user_id);
