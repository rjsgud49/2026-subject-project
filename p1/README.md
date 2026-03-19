# P1 - 면접 인강 플랫폼

docs/p1 문서(기획서, 요구사항, ERD, API)에 맞춘 구현 프로젝트입니다.

## 구조

- **backend**: NestJS + TypeORM + PostgreSQL (API 서버)
- **frontend**: React + Vite + TypeScript(TSX) (웹 클라이언트)

## 사전 요구사항

- Node.js 20 LTS
- PostgreSQL 15 이상
- npm 또는 pnpm

## 1. 데이터베이스

**PostgreSQL이 실행 중이어야 합니다.**  
`ECONNREFUSED` / "Unable to connect to the database" 가 나오면 아래를 확인하세요.

1. **PostgreSQL 설치·실행**
   - Windows: 설치 후 **서비스**에서 PostgreSQL 서비스 시작, 또는 pgAdmin에서 서버 연결
   - macOS: `brew services start postgresql@15` (또는 설치된 버전)
   - Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15`
2. **DB 생성**
   ```bash
   psql -U postgres -c "CREATE DATABASE p1_interview;"
   ```
   (또는 pgAdmin 등에서 `p1_interview` DB 생성)
3. **backend/.env** 에서 `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` 이 실제 환경과 같은지 확인

## 2. 백엔드

```bash
cd p1/backend
cp .env.example .env
# .env 에서 DB_HOST, DB_USER, DB_PASSWORD, DB_NAME 확인·수정
npm install
npm run start:dev
```

- API 서버: http://localhost:3000
- API prefix: `/api/v1`
- P1 사용자 식별: 요청 헤더 `x-user-id` (미지정 시 1)

### 시드 데이터 (선택)

DB가 비어 있을 때 사용자 1명 + 강의 1개(섹션·영상 1개) 생성:

```bash
cd p1/backend
npx ts-node -r tsconfig-paths/register src/seed.ts
```

(실행 전 `.env` 설정 및 `npm install` 필요. TypeORM synchronize: true 이면 테이블 자동 생성 후 시드만 실행)

## 3. 프론트엔드

```bash
cd p1/frontend
npm install
npm run dev
```

- 웹: http://localhost:5173
- API 호출은 Vite 프록시로 `http://localhost:3000` 으로 전달됨

## 4. 기능 요약

| 기능 | 경로 | 비고 |
|------|------|------|
| 메인(랜딩) | `/` | CTA → 강의 목록 |
| 로그인 | `/login` | Redux·세션 + API `x-user-id` |
| 강의 목록 | `/courses` | 필터·가격·페이징·카드/리스트 |
| 강의 상세 | `/courses/:id` | 소개·커리큘럼·Q&A 탭 |
| 장바구니 | `/cart` | 선택 수강신청 (로그인) |
| 결제 완료 | `/checkout/complete` | 간이 결제 안내 |
| 내 강의실 | `/dashboard` | 진도·이어보기 |
| 수업 듣기 | `/learn/:enrollmentId` | 속도·전체화면·진도 |
| Q&A | `/questions/:id` 등 | 질문·답변·본인 수정·삭제 |

## 5. 문서

