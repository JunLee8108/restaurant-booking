# La Stella — Three Michelin Stars

미슐랭 3스타 이탈리안 다이닝 **La Stella** 의 예약 및 어드민 페이지.

- **고객 페이지** (`/`) — 모던 미슐랭 톤의 단일 페이지 (Hero · 철학 · 경험 · 갤러리 · 예약 · 방문 안내)
- **어드민** (`/admin`) — 인증 보호된 예약 관리 대시보드
- **DB** — Supabase (Postgres + Auth + RLS)

## 기술 스택
- React 19 + Vite
- React Router v7
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

## Supabase 연결 (실서비스)

1. `cp .env.example .env.local` 후 키 입력
2. `supabase/README.md` 의 순서대로 마이그레이션 적용
3. 어드민 계정 생성 후 `admin_users` 테이블에 등록

## 라우트

| 경로 | 설명 |
|---|---|
| `/` | 예약 페이지 (다단계 폼) |
| `/admin/login` | 어드민 로그인 |
| `/admin` | 대시보드 (오늘의 예약/통계) |
| `/admin/reservations` | 예약 목록 (필터/검색) |
| `/admin/reservations/:id` | 예약 상세 (상태 변경/메모) |

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
