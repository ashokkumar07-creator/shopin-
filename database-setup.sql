-- ============================================================
-- Priya Kambu Kool — Supabase Database Setup
-- Run this in Supabase SQL Editor (once, before deploying)
-- ============================================================

-- Orders table: each row is one customer order request
create table if not exists public.orders (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Reviews table: each row is one customer review (public)
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Config table: stores shop open/close settings
create table if not exists public.config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed sample reviews (only if reviews table is empty)
insert into public.reviews (data)
select v.data
from (values
  ('{"name":"Kaviya S.","rating":5,"text":"Best kambu kool — cool, tangy, and just like home.","date":"2026-08-02"}'::jsonb),
  ('{"name":"Suresh M.","rating":4,"text":"The buttermilk is fresh and perfectly spiced.","date":"2026-08-14"}'::jsonb),
  ('{"name":"Anushiya S.","rating":5,"text":"The sides pair perfectly with the traditional kool.","date":"2026-08-29"}'::jsonb)
) as v(data)
where not exists (select 1 from public.reviews);

-- Seed default shop config
insert into public.config (id, data)
values ('shop_config', '{"openTime":"07:00","closeTime":"10:00","autoMode":false,"manualOpen":true}'::jsonb)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security (RLS) — IMPORTANT for security
-- ============================================================

-- Enable RLS on all tables
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.config enable row level security;

-- Only service role (server) can read/write orders (customers can INSERT via API)
-- Public can read reviews (they are public)
-- Public can read config (shop open/close is public)

-- Allow service role full access (this is the default for service role key)
-- The API functions use the service role key, so they bypass RLS automatically.

-- Public can read reviews
create policy "Public read reviews" on public.reviews
  for select using (true);

-- Public can read config  
create policy "Public read config" on public.config
  for select using (true);

-- Only service role can insert/update/delete (API functions handle this)
-- No additional policies needed — service role bypasses RLS.
