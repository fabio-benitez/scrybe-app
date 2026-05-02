
-- Index for listing categories by authenticated user.
create index idx_categories_user_id on categories(user_id);
