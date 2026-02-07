-- Ramadhan Companion - Schema + RLS (minimal wajib)
-- Jalankan di Supabase SQL Editor

create extension if not exists pgcrypto;

-- 1) profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user','admin')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 2) quran_progress
create table if not exists public.quran_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  last_surah int,
  last_ayah int,
  last_juz int,
  bookmarks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- 3) tilawah_logs
create table if not exists public.tilawah_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  surah int not null,
  ayah_from int not null,
  ayah_to int not null,
  pages_count int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- 4) memorization_plans
create table if not exists public.memorization_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_per_day int not null default 1,
  method text not null default 'murajaah',
  start_date date not null default (now()::date),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5) memorization_logs
create table if not exists public.memorization_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  surah int not null,
  ayah_from int not null,
  ayah_to int not null,
  type text not null check (type in ('baru','murajaah')),
  notes text,
  created_at timestamptz not null default now()
);

-- 6) worship_checklists
create table if not exists public.worship_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  items jsonb not null default '{}'::jsonb,
  reflection text,
  mood int,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- 7) admin_content
create table if not exists public.admin_content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('tips','challenge','announcement')),
  title text not null,
  body text not null,
  publish_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8) audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_tilawah_user_date on public.tilawah_logs(user_id, date);
create index if not exists idx_hafalan_user_date on public.memorization_logs(user_id, date);
create index if not exists idx_tracker_user_date on public.worship_checklists(user_id, date);
create index if not exists idx_audit_actor_time on public.audit_logs(actor_user_id, created_at desc);
create index if not exists idx_admin_content_active_date on public.admin_content(active, publish_date);

-- Helper function to check admin role
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.quran_progress enable row level security;
alter table public.tilawah_logs enable row level security;
alter table public.memorization_plans enable row level security;
alter table public.memorization_logs enable row level security;
alter table public.worship_checklists enable row level security;
alter table public.admin_content enable row level security;
alter table public.audit_logs enable row level security;

-- profiles policies
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

-- quran_progress policies
drop policy if exists "quran_progress_select_own_or_admin" on public.quran_progress;
create policy "quran_progress_select_own_or_admin" on public.quran_progress
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "quran_progress_insert_own" on public.quran_progress;
create policy "quran_progress_insert_own" on public.quran_progress
for insert with check (auth.uid() = user_id);

drop policy if exists "quran_progress_update_own" on public.quran_progress;
create policy "quran_progress_update_own" on public.quran_progress
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tilawah_logs policies
drop policy if exists "tilawah_select_own_or_admin" on public.tilawah_logs;
create policy "tilawah_select_own_or_admin" on public.tilawah_logs
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tilawah_insert_own" on public.tilawah_logs;
create policy "tilawah_insert_own" on public.tilawah_logs
for insert with check (auth.uid() = user_id);

drop policy if exists "tilawah_update_own" on public.tilawah_logs;
create policy "tilawah_update_own" on public.tilawah_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tilawah_delete_own" on public.tilawah_logs;
create policy "tilawah_delete_own" on public.tilawah_logs
for delete using (auth.uid() = user_id);

-- memorization_plans policies
drop policy if exists "plans_select_own_or_admin" on public.memorization_plans;
create policy "plans_select_own_or_admin" on public.memorization_plans
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "plans_insert_own" on public.memorization_plans;
create policy "plans_insert_own" on public.memorization_plans
for insert with check (auth.uid() = user_id);

drop policy if exists "plans_update_own" on public.memorization_plans;
create policy "plans_update_own" on public.memorization_plans
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "plans_delete_own" on public.memorization_plans;
create policy "plans_delete_own" on public.memorization_plans
for delete using (auth.uid() = user_id);

-- memorization_logs policies
drop policy if exists "hafalan_select_own_or_admin" on public.memorization_logs;
create policy "hafalan_select_own_or_admin" on public.memorization_logs
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "hafalan_insert_own" on public.memorization_logs;
create policy "hafalan_insert_own" on public.memorization_logs
for insert with check (auth.uid() = user_id);

drop policy if exists "hafalan_update_own" on public.memorization_logs;
create policy "hafalan_update_own" on public.memorization_logs
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "hafalan_delete_own" on public.memorization_logs;
create policy "hafalan_delete_own" on public.memorization_logs
for delete using (auth.uid() = user_id);

-- worship_checklists policies
drop policy if exists "tracker_select_own_or_admin" on public.worship_checklists;
create policy "tracker_select_own_or_admin" on public.worship_checklists
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tracker_insert_own" on public.worship_checklists;
create policy "tracker_insert_own" on public.worship_checklists
for insert with check (auth.uid() = user_id);

drop policy if exists "tracker_update_own" on public.worship_checklists;
create policy "tracker_update_own" on public.worship_checklists
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tracker_delete_own" on public.worship_checklists;
create policy "tracker_delete_own" on public.worship_checklists
for delete using (auth.uid() = user_id);

-- admin_content policies (read all authenticated users; write admin only)
drop policy if exists "admin_content_select_all" on public.admin_content;
create policy "admin_content_select_all" on public.admin_content
for select using (auth.role() = 'authenticated');

drop policy if exists "admin_content_insert_admin" on public.admin_content;
create policy "admin_content_insert_admin" on public.admin_content
for insert with check (public.is_admin());

drop policy if exists "admin_content_update_admin" on public.admin_content;
create policy "admin_content_update_admin" on public.admin_content
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_content_delete_admin" on public.admin_content;
create policy "admin_content_delete_admin" on public.admin_content
for delete using (public.is_admin());

-- audit_logs policies: user can insert own events; admin can read all
drop policy if exists "audit_select_admin" on public.audit_logs;
create policy "audit_select_admin" on public.audit_logs
for select using (public.is_admin());

drop policy if exists "audit_insert_authenticated" on public.audit_logs;
create policy "audit_insert_authenticated" on public.audit_logs
for insert with check (auth.role() = 'authenticated');

-- Seed admin_content
insert into public.admin_content (type, title, body, publish_date, active)
values
('tips','Niat & Konsistensi','Mulai dengan niat yang lurus, lalu jaga konsistensi walau sedikit.','2026-03-01',true),
('challenge','Challenge 1: 10 menit tilawah','Sediakan 10 menit khusus tilawah hari ini.','2026-03-01',true),
('announcement','Selamat Datang','Semoga Ramadhan ini lebih bermakna bersama Ramadhan Companion.','2026-03-01',true)
on conflict do nothing;
