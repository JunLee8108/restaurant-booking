-- 특정 날짜의 시간 슬롯별 잔여 좌석을 반환하는 RPC.
-- 클라이언트(익명)도 호출 가능하도록 SECURITY DEFINER 로 작성하고 권한을 부여.

create or replace function public.available_slots(p_date date)
returns table (slot_time time, remaining int)
language sql
stable
security definer
set search_path = public
as $$
  with slots as (
    select ts.slot_time, ts.capacity
    from public.time_slots ts
    where ts.is_active
      and ts.day_of_week = extract(dow from p_date)::int
  ),
  booked as (
    select r.reservation_time as slot_time,
           coalesce(sum(r.party_size), 0)::int as taken
    from public.reservations r
    where r.reservation_date = p_date
      and r.status not in ('cancelled', 'no_show')
    group by r.reservation_time
  )
  select
    s.slot_time,
    greatest(s.capacity - coalesce(b.taken, 0), 0) as remaining
  from slots s
  left join booked b on b.slot_time = s.slot_time
  order by s.slot_time;
$$;

grant execute on function public.available_slots(date) to anon, authenticated;
