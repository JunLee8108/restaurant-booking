-- La Stella — 요금 모델 v2
-- · pricing_settings: 단일 단가(정가/얼리버드/할인율) → 3카테고리 × (성인/미취학아동) 고정 단가
--   - 일반(현장시점), 사전예약(cutoff 전), 워터파크·투숙(현장시점)
--   - 성인 단가는 소인 포함, 유아는 무료
-- · reservations: customer_type(일반/워터파크·투숙) 추가
--   children 컬럼은 이제 '미취학아동' 수를 의미 (소인은 성인으로 합산)

-- ===== reservations: 방문 유형 =====
alter table public.reservations
  add column if not exists customer_type text not null default 'regular';

alter table public.reservations
  drop constraint if exists reservations_customer_type_check;
alter table public.reservations
  add constraint reservations_customer_type_check
  check (customer_type in ('regular', 'waterpark'));

-- ===== pricing_settings: 고정 단가 6칸 =====
alter table public.pricing_settings
  add column if not exists adult_regular   int not null default 40000,
  add column if not exists child_regular   int not null default 28000,
  add column if not exists adult_early     int not null default 30000,
  add column if not exists child_early     int not null default 20000,
  add column if not exists adult_waterpark int not null default 36000,
  add column if not exists child_waterpark int not null default 25000;

-- 기존 단가/할인 컬럼 제거 (early_cutoff_time 은 유지)
alter table public.pricing_settings
  drop column if exists price_regular,
  drop column if exists price_early_bird,
  drop column if exists late_discount_pct;
