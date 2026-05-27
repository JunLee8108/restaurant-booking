-- 개인정보 수집·이용 및 제3자 제공 동의 기록

alter table public.reservations
  add column if not exists privacy_consent boolean not null default false,
  add column if not exists consent_at       timestamptz;
