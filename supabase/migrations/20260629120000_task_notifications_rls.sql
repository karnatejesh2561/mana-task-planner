do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'task_notifications' and policyname = 'task_notifications_insert_own'
  ) then
    create policy task_notifications_insert_own on public.task_notifications
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'task_notifications' and policyname = 'task_notifications_update_own'
  ) then
    create policy task_notifications_update_own on public.task_notifications
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end
$$;
