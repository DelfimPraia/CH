-- =====================================================================
-- AI Oil & Gas Conference — initial schema
-- Run this in Supabase SQL Editor (or `supabase db push` if using CLI).
-- =====================================================================

-- ---------- enums ----------
create type area_tag as enum (
  'geoscience', 'engineering', 'it', 'data_science', 'management', 'other'
);

create type session_type as enum (
  'keynote', 'panel', 'talk', 'networking', 'break'
);

create type speaker_role as enum ('speaker', 'moderator');

-- ---------- profiles (1:1 with auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  company text,
  job_title text,
  area area_tag,
  linkedin_url text,
  created_at timestamptz not null default now()
);

-- Auto-create profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, company, job_title, area)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'job_title',
    nullif(new.raw_user_meta_data->>'area', '')::area_tag
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- admins ----------
create table public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- speakers ----------
create table public.speakers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  bio text,
  photo_url text,
  institution text,
  specialty text,
  linkedin_url text,
  researchgate_url text,
  created_at timestamptz not null default now()
);

-- ---------- sessions ----------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type session_type not null default 'talk',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index sessions_starts_at_idx on public.sessions (starts_at);

-- ---------- session_speakers (M:N) ----------
create table public.session_speakers (
  session_id uuid not null references public.sessions(id) on delete cascade,
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  role speaker_role not null default 'speaker',
  primary key (session_id, speaker_id)
);

-- ---------- user_favorites ("my agenda") ----------
create table public.user_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

-- ---------- check_ins ----------
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references public.profiles(id)
);

-- ---------- notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  target_user_id uuid references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index notifications_target_idx on public.notifications (target_user_id, created_at desc);
create index notifications_broadcast_idx on public.notifications (created_at desc) where target_user_id is null;

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles         enable row level security;
alter table public.admins           enable row level security;
alter table public.speakers         enable row level security;
alter table public.sessions         enable row level security;
alter table public.session_speakers enable row level security;
alter table public.user_favorites   enable row level security;
alter table public.check_ins        enable row level security;
alter table public.notifications    enable row level security;

-- profiles: anyone authenticated can read; only owner (or admin) can write.
create policy "profiles read by authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles update self"
  on public.profiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles admin all"
  on public.profiles for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- admins: readable by self only (so client can check own admin status).
create policy "admins read self"
  on public.admins for select
  to authenticated using (user_id = auth.uid());

-- speakers / sessions / session_speakers: world-readable to authenticated; admin writes.
create policy "speakers read"
  on public.speakers for select to authenticated using (true);
create policy "speakers admin write"
  on public.speakers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "sessions read"
  on public.sessions for select to authenticated using (true);
create policy "sessions admin write"
  on public.sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "session_speakers read"
  on public.session_speakers for select to authenticated using (true);
create policy "session_speakers admin write"
  on public.session_speakers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- user_favorites: owner-only.
create policy "favorites read own"
  on public.user_favorites for select to authenticated using (user_id = auth.uid());
create policy "favorites insert own"
  on public.user_favorites for insert to authenticated with check (user_id = auth.uid());
create policy "favorites delete own"
  on public.user_favorites for delete to authenticated using (user_id = auth.uid());

-- check_ins: user reads own; admin reads/writes all.
create policy "check_ins read own"
  on public.check_ins for select to authenticated using (user_id = auth.uid());
create policy "check_ins admin all"
  on public.check_ins for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- notifications: user reads broadcasts + own; admin writes.
create policy "notifications read"
  on public.notifications for select to authenticated
  using (target_user_id is null or target_user_id = auth.uid());
create policy "notifications admin write"
  on public.notifications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Realtime publication (broadcasts notifications + check-ins)
-- =====================================================================
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.check_ins;
