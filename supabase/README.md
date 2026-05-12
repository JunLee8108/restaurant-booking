# La Stella · Supabase 셋업

## 1. Supabase 프로젝트 생성 + 키 확인

1. https://supabase.com 에서 새 프로젝트 생성
2. **Settings → API Keys → "Publishable and secret API keys"** 탭으로 이동
3. 다음 두 값을 복사:
   - `Project URL` (Settings → API 페이지에서 확인)
   - `Publishable key` (`sb_publishable_...` 형식, "Publishable keys can be safely shared publicly")

> ⚠️ Secret key (`sb_secret_...`) 는 절대 클라이언트(이 Vite 앱)에 넣지 마세요. 서버/Edge Functions 전용입니다.

## 2. `.env.local` 작성

프로젝트 루트에:

```bash
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_0t2m5QQHZbCOY...
```

## 3. 마이그레이션 실행

Supabase Dashboard → **SQL Editor** 에서 아래 순서대로 붙여 넣고 실행:

1. `migrations/001_schema.sql` — 테이블 + 기본 시간 슬롯 시드
2. `migrations/002_rls.sql` — Row Level Security 정책
3. `migrations/003_available_slots.sql` — 가용 슬롯 조회 RPC

## 4. 첫 어드민 계정 만들기

1. Dashboard → **Authentication → Users → "Add user"**
   - 이메일/비밀번호 입력 (예: `admin@lastella.kr` / `lastella1234`)
2. 생성된 유저의 `id` 복사 (Users 테이블에서 확인)
3. SQL Editor 에서:
   ```sql
   insert into public.admin_users (user_id, role)
   values ('<여기에 user id 붙여넣기>', 'admin');
   ```
4. 브라우저에서 `/admin/login` 으로 접속 → 위 자격 증명으로 로그인

## 5. Vercel 배포

Vercel 프로젝트 → **Settings → Environment Variables** 에 동일하게 추가:

| Name | Value | Environment |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Production, Preview, Development |

저장 후 다음 배포부터 반영됩니다.

## 6. 영업 정책 변경

`time_slots` 테이블에서 직접 수정:
- 슬롯 추가/삭제: row insert/delete
- capacity 조정: row update
- `is_active = false` 로 두면 해당 슬롯은 노출되지 않음

## 7. 데모 모드

`.env.local` 을 설정하지 않으면 앱은 **데모 모드**로 동작합니다:
- 예약은 브라우저 `localStorage` 에 저장
- 어드민 로그인: `admin@lastella.kr` / `lastella` (sessionStorage 사용)

실서비스 전에 반드시 Supabase를 연결하세요.

## 8. 신규 API 키 체계 참고

Supabase는 2025년 이후 `anon` / `service_role` 레거시 키를 `sb_publishable_*` / `sb_secret_*` 로 대체하는 신규 체계로 이동 중입니다. 본 프로젝트는 신규 체계를 사용합니다. 레거시 키는 2026년 말까지 동작하므로 그 전에 발급한 프로젝트는 Dashboard에서 신규 키로 전환하세요.
