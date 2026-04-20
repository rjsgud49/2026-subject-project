# P2 — 역할 분리 LMS (관리자 · 강사 · 학생) + JWT 인증

README의 **project2** 범위: 역할 분리와 인증 전체(백엔드 + 프론트)를 구현했습니다. P1과 동시에 띄우기 위해 **백엔드 3010**, **프론트 5174**를 사용합니다.

## 구성

| 역할 | 경로 | 기능 |
|------|------|------|
| **관리자** | `/admin` | 대시보드 통계, 전체 회원·역할 변경, 전체 강의(비공개 포함) 조회 |
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

- API 베이스: `http://localhost:3010/api/v1`
- 헬스: `GET /api/v1/health`
- 인증: `POST /api/v1/auth/login`, `POST /api/v1/auth/signup`, `GET /api/v1/auth/me` (Bearer)

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

브라우저: `http://localhost:5174` — Vite가 `/api`를 백엔드 `3010`으로 프록시합니다.

## 기술 스택

- 백엔드: NestJS 10, TypeORM, PostgreSQL, bcrypt, **JWT (Bearer)**, 역할 가드(`admin` / `teacher` / `student`)
- 프론트: React 18, TypeScript, Vite, React Router, Context 기반 인증 상태
