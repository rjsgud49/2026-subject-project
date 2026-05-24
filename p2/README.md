# P2 — 역할 분리 LMS (관리자 · 강사 · 학생) + JWT 인증

README의 **project2** 범위: 역할 분리와 인증 전체(백엔드 + 프론트)를 구현했습니다. **백엔드 포트는 `p2/backend/.env`의 `PORT`**(예시·기본값 3000), **프론트는 5174**입니다. P1과 같이 띄울 때는 P1과 포트가 겹치지 않게 `PORT`만 조정하면 됩니다.

## 구성

| 역할 | 경로 | 기능 |
|------|------|------|
| **관리자** | `/admin` | 대시보드 통계, 전체 회원·역할 변경, 전체 강의(비공개 포함) 조회, 강의·QnA 검열 |
| **강사** | `/teacher` | 대시보드, 내 강의 CRUD, 공개 여부, 프로필(이름·소개) 수정, 학생 피드백 질의·답변 |
| **학생** | `/student` | 대시보드, 공개 강의 탐색, 수강 신청·내 수강·수강 취소, 피드백 요청·확인 |
| 공개 | `/`, `/courses`, `/courses/:id` | 홈, 강의 목록·상세(비로그인 조회, 수강은 학생 로그인 시) |
| 인증 | `/login`, `/signup` | JWT 로그인, 학생 전용 회원가입 |

## 사전 준비

1. PostgreSQL에 DB 생성: `CREATE DATABASE p2_lms;`
2. `p2/backend/.env` — `.env.example`을 복사해 수정

## 백엔드

```bash
cd p2/backend
npm install
npm run seed   # 데모 계정·강의·샘플 수강
npm run start:dev
```

- API 베이스: `http://localhost:<PORT>/api/v1` (`PORT`는 `.env`, 기본 3000)
- 헬스: `GET /api/v1/health`
- 인증: `POST /api/v1/auth/login`, `POST /api/v1/auth/signup`, `GET /api/v1/auth/me` (Bearer)
- 관리자 검열: `GET /api/v1/admin/qna`, `PATCH /api/v1/admin/courses/:id/published`, `DELETE /api/v1/admin/courses/:id`, `DELETE /api/v1/admin/qna/questions/:questionId`, `DELETE /api/v1/admin/qna/answers/:answerId`

### 시드 데모 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@p2.local | admin123 | admin |
| teacher@p2.local | teacher123 | teacher |
| student@p2.local | student123 | student |

## 프론트엔드

```bash
cd p2/frontend
npm install
npm run dev
```

브라우저: `http://localhost:5174` — Vite가 `/api`를 백엔드로 프록시합니다. **`p2/backend/.env`의 `PORT`를 읽어** `http://127.0.0.1:<PORT>`로 맞춥니다(파일이 없으면 기본 3000). 전역 덮어쓰기는 `p2/frontend/.env`의 `VITE_API_PROXY_TARGET` 전체 URL.

**터미널에 `http proxy error` / `ECONNREFUSED`가 뜨면** (1) 백엔드 터미널에 찍힌 `API http://127.0.0.1:…/api/v1` 포트와 (2) Vite 기동 시 `[vite] /api → …` 포트가 같은지 확인하세요. 백엔드 없이만 쓸 때는 `p2/frontend/.env`에 `VITE_USE_MOCK=true`.

## 기술 스택

- 백엔드: NestJS 10, TypeORM, PostgreSQL, bcrypt, **JWT (Bearer)**, 역할 가드(`admin` / `teacher` / `student`)
- 프론트: React 18, TypeScript, Vite, React Router, Context 기반 인증 상태
