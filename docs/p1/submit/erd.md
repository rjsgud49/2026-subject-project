# ERD - 면접 인강 플랫폼 (P1)

**제출 문서: ERD**  
- RDB 사용 시: 2~4장 테이블 정의 적용  
- MongoDB 사용 시: 5장 컬렉션·JSON 구조 추가 참조

---

## 1. 개요

- P1에서 필요한 핵심 엔티티와 관계를 정의합니다.
- 역할(관리자/강사/학생) 구분은 P2에서 세분화합니다.

---

## 2. 엔티티 정의 (RDB)

### 2.1 users (사용자)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 사용자 ID |
| email | VARCHAR(255), UNIQUE | 이메일 (로그인 ID) |
| name | VARCHAR(100) | 이름 |
| password_hash | VARCHAR(255) | 비밀번호 해시 (P2에서 본격 사용) |
| role | VARCHAR(20) | admin / instructor / student (P2) |
| created_at | TIMESTAMP | 가입일 |
| updated_at | TIMESTAMP | 수정일 |

### 2.2 courses (강의)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 강의 ID |
| title | VARCHAR(300) | 제목 |
| description | TEXT | 소개 |
| instructor_id | FK → users.id | 강사 ID |
| category | VARCHAR(50) | 카테고리(기술면접, 인성면접, PT면접 등) |
| difficulty | VARCHAR(20) | 초급/중급/고급 |
| price | DECIMAL(10,2) | 가격 (0이면 무료) |
| thumbnail_url | VARCHAR(500) | 썸네일 URL |
| is_published | BOOLEAN | 공개 여부 |
| created_at | TIMESTAMP | 생성일 |
| updated_at | TIMESTAMP | 수정일 |

### 2.3 course_sections (강의 섹션)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 섹션 ID |
| course_id | FK → courses.id | 강의 ID |
| title | VARCHAR(200) | 섹션 제목 |
| sort_order | INT | 목차 순서 |

### 2.4 course_videos (강의 영상)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 영상 ID |
| section_id | FK → course_sections.id | 섹션 ID |
| title | VARCHAR(200) | 영상 제목 |
| video_url | VARCHAR(500) | 영상 URL |
| duration_seconds | INT | 재생 시간(초) |
| sort_order | INT | 섹션 내 순서 |

### 2.5 enrollments (수강신청)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 수강 ID |
| user_id | FK → users.id | 수강생 ID |
| course_id | FK → courses.id | 강의 ID |
| enrolled_at | TIMESTAMP | 수강신청일 |
| status | VARCHAR(20) | active / completed |
| UNIQUE(user_id, course_id) | | 중복 수강 방지 |

### 2.6 video_progress (영상 시청 진도)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 진도 ID |
| enrollment_id | FK → enrollments.id | 수강 ID |
| video_id | FK → course_videos.id | 영상 ID |
| last_second | INT | 마지막 시청 위치(초) |
| completed | BOOLEAN | 해당 영상 완료 여부 |
| updated_at | TIMESTAMP | 마지막 시청 시각 |
| UNIQUE(enrollment_id, video_id) | | 강의·영상당 1행 |

### 2.7 cart_items (장바구니)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 장바구니 항목 ID |
| user_id | FK → users.id | 사용자 ID |
| course_id | FK → courses.id | 강의 ID |
| added_at | TIMESTAMP | 담은 시각 |
| UNIQUE(user_id, course_id) | | 강의당 1개만 담기 |

### 2.8 questions (질문 - Q&A)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 질문 ID |
| course_id | FK → courses.id | 강의 ID |
| user_id | FK → users.id | 질문자 ID |
| title | VARCHAR(200) | 제목 |
| body | TEXT | 본문 |
| is_private | BOOLEAN | 비공개 여부 (선택) |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

### 2.9 answers (답변)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | PK, BIGINT | 답변 ID |
| question_id | FK → questions.id | 질문 ID |
| user_id | FK → users.id | 답변자 ID |
| body | TEXT | 답변 내용 |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

---

## 3. 관계 요약

```
users 1 ──< enrollments >── 1 courses
users 1 ──< cart_items >── 1 courses
users 1 ──< questions >── 1 courses
users 1 ──< answers >── 1 questions
courses 1 ──< course_sections 1 ──< course_videos
enrollments 1 ──< video_progress >── 1 course_videos
questions 1 ──< answers
```

---

## 4. 인덱스 권장 (RDB)

- `courses`: category, difficulty, price, is_published, created_at
- `enrollments`: user_id, course_id
- `video_progress`: enrollment_id, video_id
- `questions`: course_id, created_at
- `cart_items`: user_id

---

## 5. MongoDB 사용 시 컬렉션·JSON 구조

MongoDB 등을 사용할 계획인 경우, 위 RDB 엔티티에 대응하는 **컬렉션(Collection)** 과 **문서(Document) JSON 구조**를 아래와 같이 설계할 수 있다.  
(필드 타입은 MongoDB BSON 기준: ObjectId, String, Number, Boolean, Date, Array, Embedded Document 등.)

### 5.1 users

```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "name": "string",
  "passwordHash": "string",
  "role": "string (admin|instructor|student)",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**인덱스 권장**: `email` (unique)

---

### 5.2 courses

```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "instructorId": "ObjectId (ref: users)",
  "category": "string",
  "difficulty": "string (초급|중급|고급)",
  "price": "number",
  "thumbnailUrl": "string",
  "isPublished": "boolean",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**인덱스 권장**: `category`, `difficulty`, `price`, `isPublished`, `createdAt`

---

### 5.3 course_sections (또는 courses 내 embedded)

**방법 A – 별도 컬렉션**

```json
{
  "_id": "ObjectId",
  "courseId": "ObjectId (ref: courses)",
  "title": "string",
  "sortOrder": "number"
}
```

**방법 B – courses 문서에 sections 배열로 embed**

```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "instructorId": "ObjectId",
  "category": "string",
  "difficulty": "string",
  "price": "number",
  "thumbnailUrl": "string",
  "isPublished": "boolean",
  "sections": [
    {
      "_id": "ObjectId",
      "title": "string",
      "sortOrder": "number",
      "videos": [
        {
          "_id": "ObjectId",
          "title": "string",
          "videoUrl": "string",
          "durationSeconds": "number",
          "sortOrder": "number"
        }
      ]
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

- 섹션·영상 조회가 항상 강의와 함께 일어나면 **방법 B(embed)** 가 유리하고, 섹션/영상만 따로 수정·조회가 많으면 **방법 A(별도 컬렉션)** 이 유리하다.

---

### 5.4 course_videos (sections를 별도 컬렉션으로 둔 경우)

```json
{
  "_id": "ObjectId",
  "sectionId": "ObjectId (ref: course_sections)",
  "title": "string",
  "videoUrl": "string",
  "durationSeconds": "number",
  "sortOrder": "number"
}
```

---

### 5.5 enrollments

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "courseId": "ObjectId (ref: courses)",
  "enrolledAt": "ISODate",
  "status": "string (active|completed)"
}
```

**유일 제약**: (userId, courseId) 복합 unique 인덱스  
**인덱스 권장**: `userId`, `courseId`

---

### 5.6 video_progress

```json
{
  "_id": "ObjectId",
  "enrollmentId": "ObjectId (ref: enrollments)",
  "videoId": "ObjectId (ref: course_videos 또는 courses.sections.videos)",
  "lastSecond": "number",
  "completed": "boolean",
  "updatedAt": "ISODate"
}
```

**유일 제약**: (enrollmentId, videoId) 복합 unique 인덱스

---

### 5.7 cart_items

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "courseId": "ObjectId (ref: courses)",
  "addedAt": "ISODate"
}
```

**유일 제약**: (userId, courseId) 복합 unique 인덱스  
**인덱스 권장**: `userId`

---

### 5.8 questions

```json
{
  "_id": "ObjectId",
  "courseId": "ObjectId (ref: courses)",
  "userId": "ObjectId (ref: users)",
  "title": "string",
  "body": "string",
  "isPrivate": "boolean",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**인덱스 권장**: `courseId`, `createdAt`

---

### 5.9 answers

```json
{
  "_id": "ObjectId",
  "questionId": "ObjectId (ref: questions)",
  "userId": "ObjectId (ref: users)",
  "body": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**인덱스 권장**: `questionId`, `createdAt`

---

### 5.10 요약

- RDB의 테이블·관계와 동일한 논리 구조를 MongoDB **컬렉션 + 복합 unique 인덱스**로 구현할 수 있다.
- 강의–섹션–영상은 **embed** 또는 **별도 컬렉션** 중 요구사항(조회/수정 패턴)에 따라 선택한다.
- API 엔드포인트와 응답 형식은 `api.yml`·`API엔드포인트.md`와 동일하게 유지하고, ID만 ObjectId 문자열로 표현하면 된다.
