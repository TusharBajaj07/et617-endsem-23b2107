-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Clickstream store: one row per meaningful learner interaction.

create table if not exists learners (
  id          text primary key,          -- anonymous id generated in the browser
  display_name text,                      -- optional nickname, no contact details
  meta        jsonb default '{}'::jsonb,  -- e.g. class, language preference
  created_at  timestamptz default now()
);

create table if not exists events (
  id           bigint generated always as identity primary key,
  ts           timestamptz not null,      -- client timestamp (ISO 8601)
  user_id      text not null,
  session_id   text not null,
  event_type   text not null,             -- session_start, item_presented, answer_submitted, hint_requested, ...
  target       text,                      -- screen / item / button id
  objective_id text,                      -- ties behaviour to a learning objective
  value        text,                      -- answer, choice, rating
  correct      boolean,                   -- null when not applicable
  duration_ms  integer,                   -- time on task
  meta         jsonb default '{}'::jsonb, -- hint level, attempt number, language, ...
  received_at  timestamptz default now()  -- server time, to spot offline-synced batches
);

create index if not exists events_user_idx      on events (user_id, ts);
create index if not exists events_objective_idx on events (objective_id);

-- Row Level Security: the browser uses the public anon key, so policies decide access.
-- Hackathon/demo policy: anyone with the app may insert and read (needed for the analytics view).
-- Production would restrict SELECT to authenticated teachers.
alter table learners enable row level security;
alter table events   enable row level security;

create policy "anon insert learners" on learners for insert to anon with check (true);
create policy "anon upsert learners" on learners for update to anon using (true) with check (true);
create policy "anon read learners"   on learners for select to anon using (true);
create policy "anon insert events"   on events   for insert to anon with check (true);
create policy "anon read events"     on events   for select to anon using (true);
