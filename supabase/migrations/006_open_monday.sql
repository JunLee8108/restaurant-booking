-- 휴무일 제거 → 월요일 영업 슬롯 추가
-- 기존엔 'where dow <> 1' 로 월요일을 제외했으나, 영업 정책이 매일 영업으로 바뀜.

insert into public.time_slots (day_of_week, slot_time, capacity)
select 1, t, 20
from (values
  ('18:00'::time), ('18:30'::time), ('19:00'::time),
  ('19:30'::time), ('20:00'::time), ('20:30'::time)
) s(t)
on conflict do nothing;
