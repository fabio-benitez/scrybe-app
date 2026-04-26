
alter table user_profiles
drop constraint if exists user_profiles_email_key;

alter table user_profiles
drop constraint if exists user_profiles_display_name_check;

alter table user_profiles
add constraint user_profiles_display_name_check
check (char_length(display_name) between 1 and 80);

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.user_profiles (
    id,
    email,
    display_name
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(split_part(new.email, '@', 1), ''),
      'User'
    )
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();