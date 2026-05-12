-- 004_fix_insert_policy.sql
-- 문제: anon INSERT만 허용했으나, 어드민 로그인 흔적이 있는 브라우저는 authenticated 역할로 요청.
--      authenticated에는 "admin only" 체크가 걸려 있어 일반 예약 INSERT가 거절됨.
-- 해결: INSERT 정책을 anon + authenticated 모두에게 풀어줌 (WITH CHECK true).
--      관리자 SELECT/UPDATE/DELETE 권한은 기존 "admin all" 정책으로 유지.

drop policy if exists "anon insert reservations"   on public.reservations;
drop policy if exists "anyone insert reservations" on public.reservations;

create policy "anyone insert reservations"
on public.reservations
for insert
to anon, authenticated
with check (true);
