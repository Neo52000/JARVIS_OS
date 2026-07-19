-- JARVIS OS — canonical schema for the Supabase backend.
-- Tables, constraints and RLS policies expected by frontend/src/api/endpoints.ts.
-- The frontend queries these tables directly with the anon key: RLS is the ONLY
-- thing isolating one user's data from another. Never disable it.

-- ── contacts ─────────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  position text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── tasks ────────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz not null default now()
);

-- ── events ───────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  all_day boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_time >= start_time)
);

-- ── notes ────────────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text,
  tags text[] default '{}',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── updated_at maintenance ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ── indexes ──────────────────────────────────────────────────────────────────
create index if not exists contacts_user_id_idx on public.contacts (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists events_time_idx on public.events (start_time, end_time);
create index if not exists notes_user_id_idx on public.notes (user_id);

-- ── row level security ───────────────────────────────────────────────────────
alter table public.contacts enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.notes enable row level security;

-- Each user only sees and mutates their own rows.
drop policy if exists "contacts_owner" on public.contacts;
create policy "contacts_owner" on public.contacts
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_owner" on public.tasks;
create policy "tasks_owner" on public.tasks
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "events_owner" on public.events;
create policy "events_owner" on public.events
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notes_owner" on public.notes;
create policy "notes_owner" on public.notes
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
