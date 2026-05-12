-- RLS 정책 (최종)
-- 핵심 원칙:
--   - reservations INSERT: 모든 역할 허용 (anon, authenticated 둘 다 손님이 될 수 있음)
--   - reservations SELECT/UPDATE/DELETE: 관리자(admin_users 에 등록된 인증 사용자)만
--   - time_slots SELECT: 누구나, 그 외 작업은 관리자만
--   - admin_users SELECT: 본인 행만
--
-- 주의: FOR ALL 정책을 쓰면 INSERT 에도 admin 체크가 함께 적용되어
--      복수 정책 OR 평가 시 잠재적 부작용이 있을 수 있음. 그래서 명령별로 분리.

alter table public.reservations enable row level security;
alter table public.time_slots   enable row level security;
alter table public.admin_users  enable row level security;

-- ===== reservations =====
drop policy if exists "anon insert reservations"     on public.reservations;
drop policy if exists "anyone insert reservations"   on public.reservations;
drop policy if exists "admin all reservations"       on public.reservations;
drop policy if exists "reservations_insert_any"      on public.reservations;
drop policy if exists "reservations_select_admin"    on public.reservations;
drop policy if exists "reservations_update_admin"    on public.reservations;
drop policy if exists "reservations_delete_admin"    on public.reservations;

-- INSERT: anon + authenticated 모두 허용
-- (TO public 으로도 가능하지만, 일부 환경에서 {anon} 으로만 저장되는 케이스가
--  관찰되어 명시적으로 두 역할 모두 지정.)
create policy "reservations_insert_any"
on public.reservations
as permissive
for insert
to anon, authenticated
with check (true);

-- SELECT: 관리자만
create policy "reservations_select_admin"
on public.reservations
as permissive
for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- UPDATE: 관리자만
create policy "reservations_update_admin"
on public.reservations
as permissive
for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- DELETE: 관리자만
create policy "reservations_delete_admin"
on public.reservations
as permissive
for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- ===== time_slots =====
drop policy if exists "anyone read time_slots"  on public.time_slots;
drop policy if exists "admin manage time_slots" on public.time_slots;
drop policy if exists "time_slots_select_any"    on public.time_slots;
drop policy if exists "time_slots_modify_admin"  on public.time_slots;

create policy "time_slots_select_any"
on public.time_slots
as permissive
for select
to public
using (true);

create policy "time_slots_modify_admin"
on public.time_slots
as permissive
for all
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- ===== admin_users =====
drop policy if exists "self read admin_users" on public.admin_users;
drop policy if exists "admin_users_self_read" on public.admin_users;

create policy "admin_users_self_read"
on public.admin_users
as permissive
for select
to authenticated
using (user_id = auth.uid());

-- PostgREST 스키마 캐시 새로고침
notify pgrst, 'reload schema';
