-- RLS 정책
-- 핵심: 익명(anon)은 reservations INSERT만 가능. 어드민(admin_users에 등록된 인증 사용자)만 전체 권한.

alter table public.reservations enable row level security;
alter table public.time_slots   enable row level security;
alter table public.admin_users  enable row level security;

-- reservations: 익명은 INSERT
drop policy if exists "anon insert reservations" on public.reservations;
create policy "anon insert reservations"
on public.reservations
for insert
to anon
with check (true);

-- reservations: 어드민은 모든 작업
drop policy if exists "admin all reservations" on public.reservations;
create policy "admin all reservations"
on public.reservations
for all
to authenticated
using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- time_slots: 누구나 SELECT, 어드민만 수정
drop policy if exists "anyone read time_slots" on public.time_slots;
create policy "anyone read time_slots"
on public.time_slots
for select
to anon, authenticated
using (true);

drop policy if exists "admin manage time_slots" on public.time_slots;
create policy "admin manage time_slots"
on public.time_slots
for all
to authenticated
using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

-- admin_users: 본인 행만 SELECT
drop policy if exists "self read admin_users" on public.admin_users;
create policy "self read admin_users"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());
