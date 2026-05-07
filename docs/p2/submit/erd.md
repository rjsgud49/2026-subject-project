# ERD — P2 LMS (PostgreSQL / TypeORM)

**제출 문서: ERD**  
구현 테이블 접두사: **`p2_`**. 개발 환경에서는 TypeORM `synchronize`로 스키마를 맞추며, 운영에서는 마이그레이션 권장.

---

## 1. 개요

- **역할**: `admin`, `teacher`, `student` — JWT + 가드로 API 접근 제어.
- **커리큘럼**: 정규화된 `course_sections` / `course_videos` 테이블 대신 **`courses.curriculum_json`** TEXT에 `{ sections: [{ id, title, videos: [{ id, title, duration, duration_seconds, video_url }] }] }` 형태로 저장.
- **영상 진도**: 커리큘럼 영상의 논리적 `id`(JSON 내 정수)를 **`p2_enrollment_video_progress.video_id`**에 저장. RDB의 별도 `course_videos` FK가 아님.

---

## 2. 엔티티 정의

### 2.1 `p2_users`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| email | VARCHAR(255) UNIQUE | 로그인 |
| name | VARCHAR(100) | 표시 이름 |
| bio | TEXT NULL | 강사 소개(짧은 텍스트) |
| profile_html | TEXT NULL | 강사 프로필 HTML |
| banner_url | VARCHAR(500) NULL | 강사 배너 이미지 URL |
| settlement_* | VARCHAR NULL | 강사 정산 정보(선택) |
| password_hash | VARCHAR(255) NULL | bcrypt 해시 |
| role | VARCHAR(20) | admin / teacher / student |
| created_at, updated_at | TIMESTAMP | |

### 2.2 `p2_courses`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| title | VARCHAR(255) | |
| description | TEXT NULL | |
| price | INT | 원 단위 등 정수 가격 |
| instructor_id | BIGINT FK → p2_users | |
| is_published | BOOLEAN | 공개 여부 |
| curriculum_json | TEXT NULL | 섹션·영상·URL 메타 |
| thumbnail_url | VARCHAR(500) NULL | |
| view_count | INT | 상세 조회 시 증가 |
| created_at, updated_at | TIMESTAMP | |

### 2.3 `p2_cart_items`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| user_id | BIGINT FK | 학생 |
| course_id | BIGINT FK | |
| created_at | TIMESTAMP | |
| **UNIQUE**(user_id, course_id) | | |

### 2.4 `p2_enrollments`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| user_id | BIGINT FK | |
| course_id | BIGINT FK | |
| enrolled_at | TIMESTAMP | |
| last_video_id | BIGINT NULL | 이어보기(커리큘럼 video id) |
| **UNIQUE**(user_id, course_id) | | |

> 목록 API의 `status`·`progress_percent`는 **저장 컬럼이 아니라** `curriculum_json` + `p2_enrollment_video_progress`로 계산해 DTO에 실음.

### 2.5 `p2_enrollment_video_progress`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| enrollment_id | BIGINT FK | ON DELETE CASCADE |
| video_id | BIGINT | 커리큘럼 JSON 내 영상 id |
| last_second | INT | 이어보기 초 |
| completed | BOOLEAN | 90% 시청 등 정책 반영 |
| updated_at | TIMESTAMP | |
| **UNIQUE**(enrollment_id, video_id) | | |

### 2.6 `p2_questions` / `p2_answers`

| 테이블 | 주요 컬럼 |
|--------|-----------|
| questions | id, course_id, user_id, title, body, is_private, created_at, updated_at |
| answers | id, question_id, user_id, body, created_at, updated_at |

### 2.7 `p2_teacher_revenue_lines` (수익·정산 원장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| teacher_id | BIGINT FK → p2_users | 강사(당시 강의 `instructor_id`) |
| course_id | BIGINT FK → p2_courses | |
| enrollment_id | BIGINT FK → p2_enrollments UNIQUE | 수강 1건당 1행 |
| price_snapshot | INT | 수강 시점 강의 가격 |
| gross_amount | INT | 매출(좌석 1건) |
| platform_fee | INT | 수수료(건당 반올림) |
| net_amount | INT | 강사 정산 예정액 |
| enrolled_at | TIMESTAMPTZ | 수강 일시(스냅샷) |
| created_at | TIMESTAMPTZ | 기록 생성 |

수강 취소 시 `enrollment` 삭제에 따라 **CASCADE**로 원장 행도 삭제된다.

### 2.8 `p2_feedbacks`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGSERIAL PK | |
| student_id | BIGINT FK | |
| teacher_id | BIGINT FK NULL | 배정 강사 |
| title | VARCHAR(200) | |
| student_question | TEXT | |
| student_attachments_json | TEXT NULL | 첨부 메타 JSON |
| teacher_question, teacher_feedback | TEXT NULL | |
| thread_json | TEXT NULL | 문답 스레드 |
| status | VARCHAR(20) | pending / in_progress / answered |
| created_at, updated_at | TIMESTAMP | |

---

## 3. 관계 요약

```
users 1 ──< courses (instructor)
users 1 ──< cart_items >── 1 courses
users 1 ──< enrollments >── 1 courses
enrollments 1 ──< enrollment_video_progress
users 1 ──< questions >── 1 courses
users 1 ──< answers >── 1 questions
users 1 ──< feedbacks (student / teacher)
enrollments 1 ──< teacher_revenue_lines (수익 원장)
```

커리큘럼 섹션·영상은 **`courses.curriculum_json`** 에 embed.

---

## 4. 인덱스 권장

- `p2_courses`: instructor_id, is_published, created_at  
- `p2_enrollments`: user_id, course_id  
- `p2_teacher_revenue_lines`: teacher_id, course_id, enrolled_at  
- `p2_enrollment_video_progress`: enrollment_id  
- `p2_questions`: course_id, created_at  
- `p2_cart_items`: user_id  

---

## 5. (참고) MongoDB 등으로 옮길 때

논리 모델은 동일하게 유지하면 되고, `curriculum_json`·`thread_json`·첨부 메타는 **문서 내 문자열/객체 필드**로 매핑하면 된다. API 응답 형식은 [api.yml](./api.yml)과 맞출 것.
