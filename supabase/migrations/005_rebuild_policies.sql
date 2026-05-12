-- 005_rebuild_policies.sql
-- 이전 마이그레이션을 이미 실행한 환경용 — RLS 정책을 깨끗하게 재구축.
-- FOR ALL 정책이 INSERT 와 충돌하는 케이스를 차단하기 위해 명령별로 분리.

-- ===== reservations =====
drop policy if exists "anon insert reservations"     on public.reservations;
drop policy if exists "anyone insert reservations"   on public.reservations;
drop policy if exists "admin all reservations"       on public.reservations;
drop policy if exists "reservations_insert_any"      on public.reservations;
drop policy if exists "reservations_select_admin"    on public.reservations;
drop policy if exists "reservations_update_admin"    on public.reservations;
drop policy if exists "reservations_delete_admin"    on public.reservations;

alter table public.reservations enable row level security;

create policy "reservations_insert_any"
on public.reservations
as permissive
for insert
to public
with check (true);

create policy "reservations_select_admin"
on public.reservations
as permissive
for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "reservations_update_admin"
on public.reservations
as permissive
for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "reservations_delete_admin"
on public.reservations
as permissive
for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- ===== time_slots =====
drop policy if exists "anyone read time_slots"   on public.time_slots;
drop policy if exists "admin manage time_slots"  on public.time_slots;
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
drop policy if exists "self read admin_users"   on public.admin_users;
drop policy if exists "admin_users_self_read"   on public.admin_users;

create policy "admin_users_self_read"
on public.admin_users
as permissive
for select
to authenticated
using (user_id = auth.uid());

-- 캐시 새로고침
notify pgrst, 'reload schema';
