-- La Stella — 성수기 특선 부페 리모델링
-- · 시간/좌석/이메일 제거
-- · 인원을 성인/소인/유아로 세분화 (성인+소인 ≤ 15)
-- · 부페 단가 설정 테이블 추가 (관리자에서 조정)

-- ===== reservations 변경 =====
alter table public.reservations
  drop column if exists email,
  drop column if exists reservation_time,
  drop column if exists seating;

alter table public.reservations
  add column if not exists adults   int not null default 1,
  add column if not exists children int not null default 0,
  add column if not exists infants  int not null default 0;

-- party_size 체크 (성인 + 소인) 1~15
alter table public.reservations
  drop constraint if exists reservations_party_size_check;
alter table public.reservations
  add constraint reservations_party_size_check
  check (party_size between 1 and 15);

-- 시간 컬럼이 빠졌으므로 인덱스 재생성
drop index if exists reservations_date_time_idx;
create index if not exists reservations_date_idx
  on public.reservations (reservation_date);

-- ===== pricing_settings (싱글톤) =====
create table if not exists public.pricing_settings (
  id                  int primary key default 1 check (id = 1),
  price_regular       int  not null default 43000,
  price_early_bird    int  not null default 30000,
  late_discount_pct   int  not null default 10 check (late_discount_pct between 0 and 100),
  early_cutoff_time   time not null default '12:00',
  updated_at          timestamptz not null default now()
);
insert into public.pricing_settings (id) values (1) on conflict do nothing;

drop trigger if exists trg_pricing_settings_updated_at on public.pricing_settings;
create trigger trg_pricing_settings_updated_at
before update on public.pricing_settings
for each row execute function public.touch_updated_at();

-- 손님(anon)도 가격 조회는 가능해야 함, 수정은 관리자만
alter table public.pricing_settings enable row level security;

drop policy if exists "pricing_settings_select_all" on public.pricing_settings;
create policy "pricing_settings_select_all"
  on public.pricing_settings
  for select
  using (true);

drop policy if exists "pricing_settings_update_admin" on public.pricing_settings;
create policy "pricing_settings_update_admin"
  on public.pricing_settings
  for update
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
