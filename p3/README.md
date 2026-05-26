# P3 — 운영형 LMS (결제 · 알림 · Webhook · 모니터링)

P2 역할 분리 LMS에 **나이스페이 결제**, **이벤트 알림(이메일/Discord)**, **Outbound Webhook**, **감사 로그·메트릭**, **스케줄 작업**, **DB 학습노트**를 추가한 프로젝트입니다.

- 백엔드: `p3/backend` — 기본 포트 **3000** (`.env`의 `PORT`)
- 프론트: `p3/frontend` — **5174** (Vite, `/api` 프록시)

## 주요 기능

| 영역 | 설명 |
|------|------|
| 결제 | 장바구니 → 나이스페이 샌드박스 결제 → 수강 등록 (`payments/`) |
| 알림 | `/settings/notifications` — 이벤트별 이메일·Discord 구독 |
| Webhook | 관리자 `/admin/ops` — HMAC 서명(`X-P3-Signature`) outbound |
| 운영 | 메트릭, 감사 로그, pending 결제 24h 만료, 미답변 피드백 일일 알림 |
| 학습 | 내 강의실 3탭(강의 / 학습노트 / Q&A), 노트는 DB 저장 |

## 사전 준비

1. PostgreSQL: `CREATE DATABASE p2_lms;` (P2·P3 동일 DB명 사용 가능)
2. `p3/backend/.env` — `p3/backend/.env.example` 복사 후 수정
3. 나이스페이 샌드박스 키(선택): 없으면 무료 강의·`free-checkout`만 사용

## 백엔드

```bash
cd p3/backend
npm install
npm run seed
npm run start:dev
```

- API: `http://localhost:<PORT>/api/v1`
- 헬스: `GET /api/v1/health` (DB ping 포함)
- 이벤트 목록: `GET /api/v1/ops/events`

### 시드 계정 (P2와 동일)

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@p2.local | admin123 | admin |
| teacher@p2.local | teacher123 | teacher |
| student@p2.local | student123 | student |

### 환경 변수 (추가)

| 변수 | 용도 |
|------|------|
| `NICEPAY_*` | 결제 샌드박스 |
| `SMTP_HOST` 등 | 이메일 알림 (없으면 서버 로그로 대체) |
| `P3_WEBHOOK_SIGNING_SECRET` | 기본 outbound 서명(엔드포인트별 secret 우선) |

## 프론트엔드

```bash
cd p3/frontend
npm install
npm run dev
```

브라우저: `http://localhost:5174`

- JWT 저장 키: `p3_access_token`
- 관리자 운영: `/admin/ops`
- 알림 설정: `/settings/notifications`

## Docker (로컬 DB)

```bash
cd p3
docker compose up -d
```

PostgreSQL만 띄웁니다. 앱은 위 npm 명령으로 실행하세요.

## 기술 스택

- 백엔드: NestJS 10, TypeORM, PostgreSQL, JWT, `@nestjs/schedule`, helmet, nodemailer
- 프론트: React 18, TypeScript, Vite, React Router
- 결제: 나이스페이 Server 승인(S2) 샌드박스

## 문서

- `docs/p3/기획서.md` — P3 범위·이벤트·API 요약
