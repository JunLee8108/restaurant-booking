# La Stella · Supabase 셋업

이 폴더의 SQL 파일을 Supabase Dashboard에서 순서대로 실행하세요.

## 1. Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트 생성
2. Settings → API 에서 `Project URL`, `anon public key` 확인
3. 프로젝트 루트에 `.env.local` 파일 생성:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

## 2. 마이그레이션 실행
Supabase Dashboard → **SQL Editor** 에서 아래 순서로 붙여 넣고 실행:

1. `migrations/001_schema.sql` — 테이블 + 기본 시간 슬롯 시드
2. `migrations/002_rls.sql` — Row Level Security 정책
3. `migrations/003_available_slots.sql` — 가용 슬롯 조회 RPC

## 3. 첫 어드민 계정 만들기
1. Supabase Dashboard → **Authentication** → **Users** → "Add user"
   - 이메일/비밀번호 입력 (예: `admin@lastella.kr` / `lastella1234`)
2. 생성된 유저의 `id` 를 복사 (Users 테이블에서 확인)
3. SQL Editor에서 다음 실행:
   ```sql
   insert into public.admin_users (user_id, role)
   values ('<여기에 user id 붙여넣기>', 'admin');
   ```
4. 브라우저에서 `/admin/login` 으로 접속 → 위 자격 증명으로 로그인

## 4. 영업 정책 변경
`time_slots` 테이블에서 직접 수정:
- 슬롯 추가/삭제: row insert/delete
- capacity 조정: row update
- `is_active = false` 로 두면 해당 슬롯은 노출되지 않음

## 5. 데모 모드
`.env.local` 을 설정하지 않으면 앱은 **데모 모드**로 동작합니다:
- 예약은 브라우저 `localStorage` 에 저장
- 어드민 로그인: `admin@lastella.kr` / `lastella` (sessionStorage 사용)

실서비스 전에 반드시 Supabase를 연결하세요.
