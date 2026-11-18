-- Applied to Supabase project beaiaexoudpuormshyxb via migration "ganit_chaupal_schema" (2026-11-18).
create table if not exists public.learners (
  id text primary key, name text not null, progress jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(), last_active timestamptz default now()
);
create table if not exists public.events (
  id bigint generated always as identity primary key, ts timestamptz not null, user_id text not null,
  session_id text not null, event_type text not null, target text, objective_id text, value text,
  correct boolean, duration_ms integer, meta jsonb default '{}'::jsonb, received_at timestamptz default now()
);
create index if not exists events_user_idx on public.events (user_id, ts);
create index if not exists events_type_idx on public.events (event_type);
create table if not exists public.reviews (
  id text primary key, learner_id text not null, learner_name text, task_id text,
  kind text not null check (kind in ('disagreement','freetext')), status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb, decision text, message jsonb,
  created_at timestamptz default now(), decided_at timestamptz
);
create index if not exists reviews_learner_idx on public.reviews (learner_id);
alter table public.learners enable row level security;
alter table public.events enable row level security;
alter table public.reviews enable row level security;
-- Demo policies: no login (shared parent phone). Production would restrict reads/updates to authenticated teachers.
create policy "app read learners" on public.learners for select to anon using (true);
create policy "app insert learners" on public.learners for insert to anon with check (true);
create policy "app update learners" on public.learners for update to anon using (true) with check (true);
create policy "app insert events" on public.events for insert to anon with check (true);
create policy "app read events" on public.events for select to anon using (true);
create policy "app read reviews" on public.reviews for select to anon using (true);
create policy "app insert reviews" on public.reviews for insert to anon with check (true);
create policy "app update reviews" on public.reviews for update to anon using (true) with check (true);
