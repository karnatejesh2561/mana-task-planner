create table if not exists public.user_notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  master_enabled boolean not null default true,
  task_reminders boolean not null default true,
  task_due_today boolean not null default true,
  task_overdue boolean not null default true,
  task_completed boolean not null default false,
  tips_and_suggestions boolean not null default false,
  promotions boolean not null default false,
  default_reminder_minutes integer not null default 15 check (default_reminder_minutes >= 0 and default_reminder_minutes <= 10080),
  snooze_minutes integer not null default 10 check (snooze_minutes >= 1 and snooze_minutes <= 1440),
  quiet_hours_start time not null default '22:00:00',
  quiet_hours_end time not null default '07:00:00',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_notification_settings
  add column if not exists master_enabled boolean not null default true,
  add column if not exists task_reminders boolean not null default true,
  add column if not exists task_due_today boolean not null default true,
  add column if not exists task_overdue boolean not null default true,
  add column if not exists task_completed boolean not null default false,
  add column if not exists tips_and_suggestions boolean not null default false,
  add column if not exists promotions boolean not null default false,
  add column if not exists default_reminder_minutes integer not null default 15,
  add column if not exists snooze_minutes integer not null default 10,
  add column if not exists quiet_hours_start time not null default '22:00:00',
  add column if not exists quiet_hours_end time not null default '07:00:00';

alter table public.tasks
  add column if not exists time_zone text not null default 'UTC';

update public.tasks
set time_zone = 'UTC'
where coalesce(time_zone, '') = '';

insert into public.user_notification_settings (user_id)
select id
from auth.users
on conflict (user_id) do nothing;

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

  insert into public.user_notification_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

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
  reminder_minutes integer;
begin
  if new.status = 'completed' then
    update public.task_notifications
      set status = 'cancelled',
          updated_at = timezone('utc', now())
    where task_id = new.id;
    return new;
  end if;

  select coalesce(default_reminder_minutes, 15)
  into reminder_minutes
  from public.user_notification_settings
  where user_id = new.user_id;

  due_at := make_timestamptz(
    extract(year from new.due_date)::int,
    extract(month from new.due_date)::int,
    extract(day from new.due_date)::int,
    extract(hour from new.due_time)::int,
    extract(minute from new.due_time)::int,
    floor(extract(second from new.due_time))::int,
    coalesce(nullif(new.time_zone, ''), 'UTC')
  );

  insert into public.task_notifications (task_id, user_id, scheduled_for, status)
  values (new.id, new.user_id, due_at - make_interval(mins => greatest(reminder_minutes, 0)), 'pending')
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

alter table public.user_notification_settings enable row level security;

drop trigger if exists set_user_notification_settings_updated_at on public.user_notification_settings;
create trigger set_user_notification_settings_updated_at
before update on public.user_notification_settings
for each row execute procedure public.set_updated_at();

drop trigger if exists sync_task_notification_trigger on public.tasks;
create trigger sync_task_notification_trigger
after insert or update of due_date, due_time, status, time_zone on public.tasks
for each row execute procedure public.sync_task_notification();

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_notification_settings' and policyname = 'user_notification_settings_select_own'
  ) then
    create policy user_notification_settings_select_own on public.user_notification_settings
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_notification_settings' and policyname = 'user_notification_settings_insert_own'
  ) then
    create policy user_notification_settings_insert_own on public.user_notification_settings
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_notification_settings' and policyname = 'user_notification_settings_update_own'
  ) then
    create policy user_notification_settings_update_own on public.user_notification_settings
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end;
$$;

create index if not exists user_notification_settings_user_id_idx on public.user_notification_settings (user_id);
create index if not exists tasks_user_id_due_timezone_idx on public.tasks (user_id, due_date, due_time, time_zone);
