-- La Stella — 예약 시스템 스키마
-- 실행: Supabase Dashboard > SQL Editor 에 붙여 넣기

create extension if not exists "pgcrypto";

-- ===== reservations =====
create table if not exists public.reservations (
  id                 uuid primary key default gen_random_uuid(),
  confirmation_code  text unique not null,
  customer_name      text not null,
  email              text not null,
  phone              text not null,
  reservation_date   date not null,
  reservation_time   time not null,
  party_size         int  not null check (party_size between 1 and 12),
  seating            text not null check (seating in ('dining_room','chefs_counter','private_salon')),
  special_requests   text,
  status             text not null default 'pending'
                     check (status in ('pending','confirmed','seated','completed','cancelled','no_show')),
  admin_notes        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists reservations_date_time_idx
  on public.reservations (reservation_date, reservation_time);
create index if not exists reservations_status_idx
  on public.reservations (status);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_reservations_updated_at on public.reservations;
create trigger trg_reservations_updated_at
before update on public.reservations
for each row execute function public.touch_updated_at();

-- ===== time_slots =====
create table if not exists public.time_slots (
  id            uuid primary key default gen_random_uuid(),
  day_of_week   int  not null check (day_of_week between 0 and 6),  -- 0=일, 1=월 ...
  slot_time     time not null,
  capacity      int  not null default 20,
  is_active     boolean not null default true,
  unique (day_of_week, slot_time)
);

-- 기본 슬롯 시드 (매일, 조식 07:00~09:30 + 저녁 18:00~21:30 30분 간격, 휴무 없음)
insert into public.time_slots (day_of_week, slot_time, capacity)
select dow, t, 20
from generate_series(0, 6) dow
cross join (values
  -- 조식
  ('07:00'::time), ('07:30'::time), ('08:00'::time),
  ('08:30'::time), ('09:00'::time), ('09:30'::time),
  -- 저녁
  ('18:00'::time), ('18:30'::time), ('19:00'::time),
  ('19:30'::time), ('20:00'::time), ('20:30'::time),
  ('21:00'::time), ('21:30'::time)
) s(t)
on conflict do nothing;

-- ===== admin_users =====
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin',
  created_at timestamptz not null default now()
);
