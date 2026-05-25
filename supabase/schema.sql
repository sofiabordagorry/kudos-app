-- Run this in the Supabase SQL Editor for a fresh project.

create table if not exists public.kudos (
  id          uuid        primary key default gen_random_uuid(),
  message     text        not null check (char_length(message) between 1 and 1000),
  signature   text        check (signature is null or char_length(signature) between 1 and 80),
  created_at  timestamptz not null default now()
);

create index if not exists kudos_created_at_idx
  on public.kudos (created_at desc);

alter table public.kudos enable row level security;

-- Anyone (anon role) can read every kudo.
drop policy if exists "kudos_read_all" on public.kudos;
create policy "kudos_read_all"
  on public.kudos
  for select
  to anon, authenticated
  using (true);

-- Anyone (anon role) can insert a kudo. No auth required.
drop policy if exists "kudos_insert_any" on public.kudos;
create policy "kudos_insert_any"
  on public.kudos
  for insert
  to anon, authenticated
  with check (true);
