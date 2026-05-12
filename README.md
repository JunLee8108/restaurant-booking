# La Stella — Three Michelin Stars

미슐랭 3스타 이탈리안 다이닝 **La Stella** 의 예약 및 어드민 페이지.

- **고객 페이지** (`/`) — 모던 미슐랭 톤의 랜딩 (Hero · 철학 · 경험 · 갤러리 · 방문 안내 · 예약 CTA)
- **예약 페이지** (`/reserve`) — 사이드 정보 + 다단계 폼
- **어드민** (`/admin`) — 인증 보호된 예약 관리 대시보드
- **DB** — Supabase (Postgres + Auth + RLS)

## 기술 스택
- React 19 + Vite
- React Router v7 (`react-router`)
- React Hook Form + Zod
- date-fns
- Supabase JS

## 빠른 시작

```bash
npm install
npm run dev
```

`.env.local` 없이도 **데모 모드**로 전체 흐름을 체험할 수 있습니다.
- 예약 데이터: 브라우저 `localStorage`
- 어드민 로그인: `admin@lastella.kr` / `lastella`

## 환경 변수

### 로컬 — `.env.local`

```bash
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

- Supabase Dashboard → **Settings → API Keys → "Publishable and secret API keys"** 탭에서 `Publishable key` 복사
- **Secret key(`sb_secret_*`)는 절대 이 SPA에 넣지 마세요** — `VITE_*` 환경변수는 클라이언트 번들에 박힙니다. Secret 키는 서버/Edge Function 전용입니다.
- `.env.local` 은 `.gitignore` 에 의해 git에 올라가지 않습니다.

### Vercel (Production / Preview / Development)

1. Vercel 프로젝트 → **Settings → Environment Variables**
2. 두 변수 추가 (3개 환경 모두 체크):

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xxxxxxx.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

3. 저장 후 다음 배포부터 자동 반영 (또는 **Redeploy**).

## Supabase 셋업

`supabase/README.md` 참고. 요약:
1. Supabase 프로젝트 생성 → URL · Publishable key 복사
2. SQL Editor 에서 `supabase/migrations/` 의 SQL을 순서대로 실행
3. Authentication 에서 어드민 계정 생성 후 `admin_users` 테이블에 등록

## 라우트

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 — Hero, 철학, 경험, 갤러리, 방문 안내, 예약 CTA |
| `/reserve` | 예약 페이지 (다단계 폼) |
| `/admin/login` | 어드민 로그인 |
| `/admin` | 대시보드 |
| `/admin/reservations` | 예약 목록 (필터/검색) |
| `/admin/reservations/:id` | 예약 상세 (상태/메모) |

## 디자인 노트
- 컬러: 잉크 차콜 / 아이보리 / 챔페인 골드
- 타이포: Cormorant Garamond (디스플레이) · Noto Serif KR (본문) · Inter (UI)
- 모션: IntersectionObserver 기반 fade-up, 600~900ms ease

## 스크립트
```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 프리뷰
npm run lint     # eslint
```
