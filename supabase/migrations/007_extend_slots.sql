-- 영업 시간 확장: 조식 07:00~09:30 + 저녁 21:00, 21:30 추가
-- 기존 환경(저녁 18:00~20:30 만 시드된 경우)에 빠진 슬롯을 모든 요일에 채워 넣음.

insert into public.time_slots (day_of_week, slot_time, capacity)
select dow, t, 20
from generate_series(0, 6) dow
cross join (values
  -- 조식
  ('07:00'::time), ('07:30'::time), ('08:00'::time),
  ('08:30'::time), ('09:00'::time), ('09:30'::time),
  -- 저녁 (확장)
  ('21:00'::time), ('21:30'::time)
) s(t)
on conflict do nothing;
