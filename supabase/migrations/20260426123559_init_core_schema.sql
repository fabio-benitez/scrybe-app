
-- Enums
create type content_status as enum ('draft', 'published', 'archived');
create type content_visibility as enum ('private', 'public');


-- =========================
-- updated_at helper
-- =========================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- =========================
-- user_profiles
-- =========================

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  email text not null unique,
  display_name text not null,

  avatar_file_id uuid null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (char_length(display_name) between 2 and 80)
);


-- =========================
-- files
-- =========================

create table files (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references user_profiles(id) on delete cascade,

  bucket text not null,
  object_path text not null,

  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,

  created_at timestamptz not null default now(),

  unique (bucket, object_path),
  unique (user_id, id),

  check (size_bytes >= 0),
  check (char_length(original_name) > 0),
  check (char_length(bucket) > 0),
  check (char_length(object_path) > 0)
);

-- FK avatar
alter table user_profiles
add constraint fk_user_profiles_avatar
foreign key (id, avatar_file_id)
references files(user_id, id)
on delete set null (avatar_file_id);


-- =========================
-- categories
-- =========================

create table categories (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references user_profiles(id) on delete cascade,

  name text not null,
  slug text not null,
  description text null,
  color text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, id),
  unique (user_id, slug),
  unique (user_id, name),

  check (char_length(name) between 1 and 80),
  check (char_length(slug) between 1 and 100),

  check (
    color is null or color in (
      'gray','red','orange','yellow',
      'green','blue','purple','pink'
    )
  )
);


-- =========================
-- tags
-- =========================

create table tags (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references user_profiles(id) on delete cascade,

  name text not null,
  slug text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, id),
  unique (user_id, slug),
  unique (user_id, name),

  check (char_length(name) between 1 and 50),
  check (char_length(slug) between 1 and 80)
);


-- =========================
-- contents
-- =========================

create table contents (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references user_profiles(id) on delete cascade,
  category_id uuid null,

  title text not null,
  slug text null,
  summary text null,

  content jsonb not null,

  status content_status not null default 'draft',
  visibility content_visibility not null default 'private',

  is_favorite boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz null,

  deleted_at timestamptz null,
  delete_after timestamptz null,

  unique (user_id, id),
  unique (user_id, slug),

  foreign key (user_id, category_id)
    references categories(user_id, id)
    on delete set null (category_id),

  check (char_length(title) between 1 and 200),
  check (slug is null or char_length(slug) between 1 and 220),
  check (summary is null or char_length(summary) <= 500),
  check (jsonb_typeof(content) = 'object'),
  check (status != 'published' or published_at is not null),

  check (
    (deleted_at is null and delete_after is null)
    or
    (deleted_at is not null and delete_after is not null)
  )
);


-- =========================
-- content_tags
-- =========================

create table content_tags (
  user_id uuid not null,
  content_id uuid not null,
  tag_id uuid not null,

  created_at timestamptz not null default now(),

  primary key (content_id, tag_id),

  foreign key (user_id, content_id)
    references contents(user_id, id)
    on delete cascade,

  foreign key (user_id, tag_id)
    references tags(user_id, id)
    on delete cascade
);


-- =========================
-- content_files
-- =========================

create table content_files (
  user_id uuid not null,
  content_id uuid not null,
  file_id uuid not null,

  position int null,
  created_at timestamptz not null default now(),

  primary key (content_id, file_id),

  foreign key (user_id, content_id)
    references contents(user_id, id)
    on delete cascade,

  foreign key (user_id, file_id)
    references files(user_id, id)
    on delete cascade,

  check (position is null or position >= 0)
);


-- =========================
-- updated_at triggers
-- =========================

create trigger set_user_profiles_updated_at
before update on user_profiles
for each row execute function set_updated_at();

create trigger set_categories_updated_at
before update on categories
for each row execute function set_updated_at();

create trigger set_tags_updated_at
before update on tags
for each row execute function set_updated_at();

create trigger set_contents_updated_at
before update on contents
for each row execute function set_updated_at();


-- =========================
-- Indexes
-- =========================

create index idx_contents_user_status on contents(user_id, status);
create index idx_contents_user_visibility on contents(user_id, visibility);
create index idx_contents_user_category on contents(user_id, category_id);

create index idx_contents_user_favorite
  on contents(user_id)
  where is_favorite = true;

create index idx_contents_user_deleted on contents(user_id, deleted_at);

create index idx_contents_delete_after
  on contents(delete_after)
  where delete_after is not null;

create index idx_contents_user_updated on contents(user_id, updated_at desc);

create index idx_content_tags_tag_id on content_tags(tag_id);

create index idx_content_files_file_id on content_files(file_id);