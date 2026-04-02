# 면접인강 P1 — 실행 가이드

> GitHub에서 클론한 직후부터 정상 실행까지의 전체 순서입니다.  
> **DB → 백엔드 → 프론트엔드** 순으로 진행하세요.

---

## 사전 준비 (필수 설치)

| 항목 | 버전 | 확인 명령 |
|------|------|-----------|
| Node.js | 20 LTS | `node -v` |
| npm | 10 이상 | `npm -v` |
| PostgreSQL | 15 이상 | `psql --version` |

---

## STEP 1 — 데이터베이스 (PostgreSQL)

### 1-1. PostgreSQL 실행

**Windows**
```
서비스(services.msc) → postgresql-x64-15 → 시작
또는 pgAdmin을 열어 서버 연결
```

**macOS**
```bash
brew services start postgresql@15
```

**Docker (설치 없이 바로 사용)**
```bash
docker run -d \
  --name p1-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15
```

---

### 1-2. 데이터베이스 생성

```bash
psql -U postgres -c "CREATE DATABASE p1_interview;"
```

> pgAdmin을 사용한다면 좌측 트리에서 **Databases → Create → Database** 로 `p1_interview` 생성

---

## STEP 2 — 백엔드 (NestJS)

### 2-1. 환경변수 설정

```bash
cd p1/backend
cp .env.example .env
```

`.env` 파일을 열어 아래 값이 실제 DB 설정과 일치하는지 확인합니다.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres      # PostgreSQL 설치 시 설정한 비밀번호
DB_NAME=p1_interview
NODE_ENV=development
```

---

### 2-2. 패키지 설치 및 서버 실행

```bash
cd p1/backend
npm install
npm run start:dev
```

터미널에 아래 메시지가 뜨면 정상입니다.

```
[NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

---

### 2-3. 시드 데이터 삽입 (최초 1회)

DB가 비어 있으면 강의 목록이 표시되지 않습니다.  
**백엔드 서버가 실행 중인 상태**에서 새 터미널을 열고 실행합니다.

```bash
cd p1/backend
npx ts-node -r tsconfig-paths/register src/seed.ts
```

완료 메시지 예시:
```
Seed done. courses_total=120 (new=120, target=120+), cart=2, enroll=2
```

> 이미 데이터가 있으면 중복 삽입 없이 건너뜁니다. 반복 실행해도 안전합니다.

---

### 2-4. 기본 계정 정보

시드 실행 후 아래 계정으로 로그인할 수 있습니다.

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 학습자(학생) | `student@p1.local` | `p1pass1234` |
| 강사 | `instructor@p1.local` | `teach1234` |

---

## STEP 3 — 프론트엔드 (React + Vite)

### 3-1. 환경변수 설정

```bash
cd p1/frontend
cp .env.example .env
```

`.env` 파일 기본값:

```env
VITE_USE_MOCK=false   # 백엔드 서버 사용 (권장)
```

> 백엔드 없이 목업 데이터로만 실행하고 싶다면 `VITE_USE_MOCK=true` 로 변경

---

### 3-2. 패키지 설치 및 개발 서버 실행

```bash
cd p1/frontend
npm install
npm run dev
```

브라우저에서 **http://localhost:5173** 접속

---

## 전체 실행 순서 요약

```
1. PostgreSQL 서비스 시작
2. psql -U postgres -c "CREATE DATABASE p1_interview;"
3. cd p1/backend && cp .env.example .env
4. cd p1/backend && npm install && npm run start:dev
5. (새 터미널) cd p1/backend && npx ts-node -r tsconfig-paths/register src/seed.ts
6. cd p1/frontend && cp .env.example .env
7. cd p1/frontend && npm install && npm run dev
8. 브라우저에서 http://localhost:5173 접속
```

---

## 포트 정보

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:5173 |
| 백엔드 API | http://localhost:3000 |
| API prefix | http://localhost:3000/api/v1 |

---

## 자주 발생하는 오류

### `ECONNREFUSED` / "Unable to connect to the database"
→ PostgreSQL 서비스가 실행 중이지 않거나, `.env`의 DB 정보가 틀린 경우  
→ `psql -U postgres` 로 접속 테스트 후 `.env` 값 재확인

### `CREATE DATABASE` 권한 오류
→ postgres 슈퍼유저 계정이 아닌 경우  
→ `psql -U postgres` 대신 실제 관리자 계정 사용

### `npm install` 후 `ts-node` 명령 없음
→ `node_modules` 설치가 완료된 `p1/backend` 디렉터리에서 실행했는지 확인  
→ 글로벌 설치: `npm install -g ts-node tsconfig-paths`

### 프론트엔드에서 API 호출이 안 될 때
→ 백엔드(`localhost:3000`)가 먼저 실행 중인지 확인  
→ Vite 프록시가 `/api/*` 요청을 `localhost:3000`으로 전달하므로 백엔드 필수

### 강의 목록이 비어 있을 때
→ 시드 데이터 삽입(STEP 2-3)이 완료되었는지 확인

---

## 목업 모드 (백엔드 없이 실행)

DB나 백엔드 없이 프론트엔드만 확인하고 싶을 때:

```bash
# p1/frontend/.env
VITE_USE_MOCK=true
```

```bash
cd p1/frontend
npm run dev
```

> 목업 모드에서는 로그인·장바구니·수강신청 등 모든 기능이 메모리 기반으로 동작합니다.  
> 새로고침 시 데이터가 초기화됩니다.
