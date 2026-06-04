-- La Stella — 예약 시점 금액 스냅샷
-- 예약 생성 시점에 적용된 단가/총액을 예약 레코드에 고정 저장한다.
-- 이후 pricing_settings 단가가 바뀌어도 과거 예약 금액은 변하지 않는다.
--   · price_tier   : 적용된 단가 종류 (early / regular / waterpark)
--   · price_adult  : 확정 성인 1인 단가
--   · price_child  : 확정 미취학아동 1인 단가
--   · total_amount : 확정 총액 (성인×단가 + 미취학×단가, 유아 무료)

alter table public.reservations
  add column if not exists price_tier   text,
  add column if not exists price_adult  int,
  add column if not exists price_child  int,
  add column if not exists total_amount int;

alter table public.reservations
  drop constraint if exists reservations_price_tier_check;
alter table public.reservations
  add constraint reservations_price_tier_check
  check (price_tier is null or price_tier in ('early', 'regular', 'waterpark'));
