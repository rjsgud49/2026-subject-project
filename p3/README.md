# P3 — 운영형 LMS (결제 · 알림 · Webhook · 모니터링)



P2 역할 분리 LMS에 **온라인 결제**, **이벤트 알림(이메일/Discord)**, **Outbound Webhook**, **감사 로그·메트릭**, **스케줄 작업**, **DB 학습노트**를 추가한 프로젝트입니다.



- 백엔드: `p3/backend` — 기본 포트 **3000** (`.env`의 `PORT`)

- 프론트: `p3/frontend` — **5174** (Vite, `/api` 프록시)



## 주요 기능



| 영역 | 설명 |

|------|------|

| 결제 | 장바구니 → 카드·간편결제 → 수강 등록 (`payments/`) |

| 알림 | `/settings/notifications` — 이벤트별 이메일·Discord 구독 |

| Webhook | 관리자 `/admin/ops` — HMAC 서명(`X-P3-Signature`) outbound |

| 운영 | 메트릭, 감사 로그, pending 결제 24h 만료, 미답변 피드백 일일 알림 |

| 학습 | 내 강의실 3탭(강의 / 학습노트 / Q&A), 노트는 DB 저장 |



## 사전 준비



1. PostgreSQL: `CREATE DATABASE p2_lms;` (P2·P3 동일 DB명 사용 가능)

2. `p3/backend/.env` — `p3/backend/.env.example` 복사 후 수정

3. 결제 PG 키(선택): 없으면 무료 강의·`free-checkout`만 사용



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

| `PAYMENT_*` | 온라인 결제 PG 연동 (`NICEPAY_*` 별칭 동일) |

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



## 배포 (EC2)

GitHub Actions가 `git pull` 후 빌드·`pm2 restart`만 수행합니다. **`.env`는 Git에 포함되지 않으므로 서버에 직접 설정**해야 합니다.

```bash
# EC2 — 최초 1회
cd ~/2026-subject-project/p3/backend
cp .env.example .env
nano .env   # 아래 항목 입력 후 저장
npm run build
pm2 start ecosystem.config.cjs   # 또는 pm2 restart p3-backend --update-env
```

운영 `.env` 필수 예시:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://olp.rjsgud.com
PAYMENT_CLIENT_ID=나이스페이_클라이언트_ID
PAYMENT_SECRET_KEY=나이스페이_시크릿키
PAYMENT_RETURN_BASE=https://olp.rjsgud.com
```

설정 확인:

```bash
curl -s https://olp.rjsgud.com/api/v1/payments/config
# {"enabled":true,"clientId":"...","jsUrl":"..."} 이면 정상
```

`enabled: false`이면 `.env` 키 누락 또는 PM2 재시작 필요 (`pm2 restart p3-backend --update-env`). 서버 로그에 `결제 PG 미설정` 경고가 보이면 동일 원인입니다.

**운영 DB 스키마** (`NODE_ENV=production`은 자동 동기화 안 함): 최초 1회

```bash
cd p3/backend
bash scripts/ec2-recover.sh
```

또는 `.env`에 `DB_SYNC=true` 한 줄 추가 → `pm2 restart p3-backend --update-env` → 기동 확인 후 `DB_SYNC` 삭제.

`column User.phone does not exist` / `PaymentOrder.orderType` / **502 Bad Gateway** 는 위로 해결합니다.

### 프론트 ↔ 백엔드 연결 안 될 때

| 환경 | 증상 | 확인 |
|------|------|------|
| **로컬** | `ECONNREFUSED`, 강의 목록 실패 | PostgreSQL 실행 → `p3/backend`에서 `npm run start:dev` → `p3/frontend`에서 `npm run dev` (5174). Vite 로그 `[vite] /api → http://127.0.0.1:3000` 확인 |
| **배포** | 502 Bad Gateway | EC2에서 `pm2 status`, `pm2 logs p3-backend`. `npm install && npm run build` 후 재시작. `curl http://127.0.0.1:3000/api/v1/health` |
| **배포** | 200인데 API만 실패 | nginx에 `/api/` → `127.0.0.1:3000` 프록시 필요. 예시: `p3/deploy/nginx-olp.example.conf` |

로컬 DB 비밀번호 오류(`password authentication failed`)면 `p3/backend/.env`의 `DB_PASSWORD`를 PostgreSQL 실제 비밀번호와 맞추세요.

## Docker (로컬 DB)



```bash

cd p3

docker compose up -d

```



PostgreSQL만 띄웁니다. 앱은 위 npm 명령으로 실행하세요.



## 기술 스택



- 백엔드: NestJS 10, TypeORM, PostgreSQL, JWT, `@nestjs/schedule`, helmet, nodemailer

- 프론트: React 19, TypeScript, Vite, React Router 7

- 결제: PG Server 승인 연동



## 문서



- `docs/p3/기획서.md` — P3 범위·이벤트·API 요약

