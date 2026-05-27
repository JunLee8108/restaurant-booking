-- 고객 본인 예약 조회 RPC
-- · 예약번호 + 전화번호가 모두 일치하는 1건만 반환 (코드 추측 방지)
-- · 전화번호는 숫자만 추출해 비교 (하이픈/공백 무시)
-- · admin_notes 등 내부 정보는 노출하지 않음

create or replace function public.lookup_reservation(p_code text, p_phone text)
returns table (
  confirmation_code text,
  customer_name     text,
  reservation_date  date,
  adults            int,
  children          int,
  infants           int,
  party_size        int,
  special_requests  text,
  status            text,
  created_at        timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.confirmation_code,
    r.customer_name,
    r.reservation_date,
    r.adults,
    r.children,
    r.infants,
    r.party_size,
    r.special_requests,
    r.status,
    r.created_at
  from public.reservations r
  where upper(trim(r.confirmation_code)) = upper(trim(p_code))
    and regexp_replace(r.phone, '[^0-9]', '', 'g')
      = regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
    and regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') <> ''
  limit 1;
$$;

grant execute on function public.lookup_reservation(text, text) to anon, authenticated;

-- 정리: 부페 리모델링(008)에서 reservation_time 컬럼이 제거되어
-- 더 이상 동작하지 않는 available_slots RPC 삭제.
drop function if exists public.available_slots(date);
