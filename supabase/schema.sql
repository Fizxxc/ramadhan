-- Ramadhan Companion: Schema + Indexes + RLS Policies
-- Jalankan di Supabase SQL Editor

create extension if not exists pgcrypto;

-- 1) profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user','admin')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- 2) quran_progress
create table if not exists public.quran_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_surah int,
  last_ayah int,
  last_juz int,
  bookmarks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists quran_progress_user_unique on public.quran_progress(user_id);

-- 3) tilawah_logs
create table if not exists public.tilawah_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  surah int not null,
  ayah_from int not null,
  ayah_to int not null,
  pages_count int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists tilawah_logs_user_date_idx on public.tilawah_logs(user_id, date);
create index if not exists tilawah_logs_date_idx on public.tilawah_logs(date);

-- 4) memorization_plans
create table if not exists public.memorization_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_per_day int not null,
  method text not null default 'murajaah' check (method in ('murajaah','setoran','campuran')),
  start_date date not null,
  active boolean not null default true
);

create index if not exists memorization_plans_user_active_idx on public.memorization_plans(user_id, active);

-- 5) memorization_logs
create table if not exists public.memorization_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  surah int not null,
  ayah_from int not null,
  ayah_to int not null,
  type text not null check (type in ('baru','murajaah')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists memorization_logs_user_date_idx on public.memorization_logs(user_id, date);
create index if not exists memorization_logs_date_idx on public.memorization_logs(date);

-- 6) worship_checklists
create table if not exists public.worship_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  items jsonb not null default '{}'::jsonb,
  reflection text,
  mood int check (mood between 1 and 5),
  created_at timestamptz not null default now()
);

create unique index if not exists worship_checklists_user_date_unique on public.worship_checklists(user_id, date);

-- 7) admin_content
create table if not exists public.admin_content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('tips','challenge','announcement')),
  title text not null,
  body text not null,
  publish_date date not null,
  active boolean not null default true
);

create index if not exists admin_content_type_date_idx on public.admin_content(type, publish_date);
create index if not exists admin_content_active_idx on public.admin_content(active);

-- 8) audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity, created_at desc);

-- Helper: admin check
create or replace function public.is_admin(uid uuid)
returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
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

-- PROFILES policies
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin(auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

-- QURAN_PROGRESS policies
create policy "quran_progress_crud_own"
on public.quran_progress for all
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- TILAWAH_LOGS policies
create policy "tilawah_logs_crud_own"
on public.tilawah_logs for all
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- MEMORIZATION_PLANS policies
create policy "memorization_plans_crud_own"
on public.memorization_plans for all
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- MEMORIZATION_LOGS policies
create policy "memorization_logs_crud_own"
on public.memorization_logs for all
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- WORSHIP_CHECKLISTS policies
create policy "worship_checklists_crud_own"
on public.worship_checklists for all
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ADMIN_CONTENT policies
create policy "admin_content_read_active_for_users"
on public.admin_content for select
using (active = true);

create policy "admin_content_admin_crud"
on public.admin_content for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- AUDIT_LOGS policies
create policy "audit_logs_read_own_or_admin"
on public.audit_logs for select
using (actor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "audit_logs_insert_own"
on public.audit_logs for insert
with check (actor_user_id = auth.uid());

-- Seed minimal admin_content
insert into public.admin_content (type, title, body, publish_date, active)
values
('tips','Niat yang Konsisten','Mulai hari ini dengan niat yang jelas dan kecil tapi rutin.', current_date, true),
('challenge','Tantangan 10 Menit','Luangkan 10 menit untuk tilawah dengan fokus dan tartil.', current_date, true),
('announcement','Selamat Datang','Ramadhan Companion siap menemani ibadah Anda.', current_date, true)
on conflict do nothing;
