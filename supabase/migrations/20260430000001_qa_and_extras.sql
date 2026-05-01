-- =====================================================================
-- Q&A and live engagement extras.
-- Run AFTER 20260430000000_initial_schema.sql.
-- =====================================================================

-- ---------- questions ----------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 3 and 500),
  is_answered boolean not null default false,
  created_at timestamptz not null default now()
);

create index questions_session_idx on public.questions (session_id, created_at desc);

-- ---------- question_upvotes ----------
create table public.question_upvotes (
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

-- ---------- view: questions with upvote counts (saves a join client-side) ----------
create or replace view public.questions_ranked as
select
  q.id,
  q.session_id,
  q.user_id,
  q.body,
  q.is_answered,
  q.created_at,
  p.full_name as author_name,
  coalesce(uv.upvote_count, 0)::int as upvote_count
from public.questions q
join public.profiles p on p.id = q.user_id
left join (
  select question_id, count(*) as upvote_count
  from public.question_upvotes
  group by question_id
) uv on uv.question_id = q.id;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.questions       enable row level security;
alter table public.question_upvotes enable row level security;

create policy "questions read"
  on public.questions for select to authenticated using (true);
create policy "questions insert own"
  on public.questions for insert to authenticated with check (user_id = auth.uid());
create policy "questions delete own or admin"
  on public.questions for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "questions update admin (mark answered)"
  on public.questions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "upvotes read"
  on public.question_upvotes for select to authenticated using (true);
create policy "upvotes insert own"
  on public.question_upvotes for insert to authenticated with check (user_id = auth.uid());
create policy "upvotes delete own"
  on public.question_upvotes for delete to authenticated using (user_id = auth.uid());

-- =====================================================================
-- Realtime
-- =====================================================================
alter publication supabase_realtime add table public.questions;
alter publication supabase_realtime add table public.question_upvotes;
