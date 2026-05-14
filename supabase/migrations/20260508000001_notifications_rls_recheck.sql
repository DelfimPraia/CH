-- =====================================================================
-- Re-verify notifications RLS + realtime publication.
-- Idempotent. Run if broadcasts are not reaching regular (non-admin) users.
-- =====================================================================

alter table public.notifications enable row level security;

-- Anyone authenticated can read broadcasts (target_user_id is null) and
-- notifications addressed to them.
drop policy if exists "notifications read" on public.notifications;
create policy "notifications read"
  on public.notifications for select to authenticated
  using (target_user_id is null or target_user_id = auth.uid());

-- Admins can do everything (insert broadcasts, etc.).
drop policy if exists "notifications admin write" on public.notifications;
create policy "notifications admin write"
  on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Make sure the table is in the realtime publication so postgres_changes
-- events are emitted at all.
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Quick sanity check — should list both policies:
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'notifications';
