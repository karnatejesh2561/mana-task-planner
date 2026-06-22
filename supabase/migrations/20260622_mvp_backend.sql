create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  about text,
  photo_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  due_time time not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('android', 'ios')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_notifications (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.sync_task_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  due_at timestamptz;
begin
  if new.status = 'completed' then
    update public.task_notifications
      set status = 'cancelled',
          updated_at = timezone('utc', now())
    where task_id = new.id;
    return new;
  end if;

  due_at := ((new.due_date::text || ' ' || new.due_time::text)::timestamp at time zone 'UTC');

  insert into public.task_notifications (task_id, user_id, scheduled_for, status)
  values (new.id, new.user_id, due_at, 'pending')
  on conflict (task_id) do update
    set scheduled_for = excluded.scheduled_for,
        user_id = excluded.user_id,
        status = 'pending',
        sent_at = null,
        error_message = null,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.update_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set email = new.email,
        full_name = coalesce(new.raw_user_meta_data ->> 'full_name', public.profiles.full_name),
        updated_at = timezone('utc', now())
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update on auth.users
for each row execute procedure public.update_profile_email_from_auth();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute procedure public.set_updated_at();

drop trigger if exists set_fcm_tokens_updated_at on public.fcm_tokens;
create trigger set_fcm_tokens_updated_at
before update on public.fcm_tokens
for each row execute procedure public.set_updated_at();

drop trigger if exists set_task_notifications_updated_at on public.task_notifications;
create trigger set_task_notifications_updated_at
before update on public.task_notifications
for each row execute procedure public.set_updated_at();

drop trigger if exists sync_task_notification_trigger on public.tasks;
create trigger sync_task_notification_trigger
after insert or update of due_date, due_time, status on public.tasks
for each row execute procedure public.sync_task_notification();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.fcm_tokens enable row level security;
alter table public.task_notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own on public.profiles
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own'
  ) then
    create policy profiles_insert_own on public.profiles
      for insert with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_select_own'
  ) then
    create policy tasks_select_own on public.tasks
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_insert_own'
  ) then
    create policy tasks_insert_own on public.tasks
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_update_own'
  ) then
    create policy tasks_update_own on public.tasks
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tasks' and policyname = 'tasks_delete_own'
  ) then
    create policy tasks_delete_own on public.tasks
      for delete using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fcm_tokens' and policyname = 'fcm_tokens_select_own'
  ) then
    create policy fcm_tokens_select_own on public.fcm_tokens
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fcm_tokens' and policyname = 'fcm_tokens_insert_own'
  ) then
    create policy fcm_tokens_insert_own on public.fcm_tokens
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fcm_tokens' and policyname = 'fcm_tokens_update_own'
  ) then
    create policy fcm_tokens_update_own on public.fcm_tokens
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'task_notifications' and policyname = 'task_notifications_select_own'
  ) then
    create policy task_notifications_select_own on public.task_notifications
      for select using (auth.uid() = user_id);
  end if;
end;
$$;

create index if not exists tasks_user_id_due_date_idx on public.tasks (user_id, due_date, due_time);
create index if not exists tasks_user_id_status_idx on public.tasks (user_id, status);
create index if not exists fcm_tokens_user_id_idx on public.fcm_tokens (user_id);
create index if not exists task_notifications_status_scheduled_for_idx on public.task_notifications (status, scheduled_for);
