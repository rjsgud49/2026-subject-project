# API 엔드포인트 — P2 LMS (구현 기준)

**Base URL**: `/api/v1`  
**인증**: 대부분의 보호 API는 `Authorization: Bearer <JWT>` 필요. 역할은 `admin` | `teacher` | `student`.  
**상세 스펙(요약)**: [api.yml](./api.yml)

---

## 1. 공개·헬스

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | /health | 없음 | 서버 상태 |
| GET | /courses | 없음 | 공개 강의 목록 (`page`, `size`) |
| GET | /courses/{id} | 없음 | 공개 강의 상세(조회수 증가, `sections`는 `curriculum_json` 파싱) |
| GET | /courses/{courseId}/questions | 없음 | 강의별 Q&A 목록 (`page`, `size`) |
| GET | /questions/{questionId} | 없음 | 질문 상세 + 답변 |
| GET | /files/{name} | 없음 | 업로드 정적 파일(파일명 검증) |

---

## 2. 인증 (auth)

| 메서드 | 경로 | 역할 | 설명 |
|--------|------|------|------|
| POST | /auth/login | — | 로그인 → `access_token`, `user` |
| POST | /auth/signup | — | 회원가입(역할 지정 가능, 시드·정책에 따름) |
| GET | /auth/me | JWT | 현재 사용자 |

---

## 3. 장바구니 (cart) — student

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /cart | 내 장바구니 목록 |
| POST | /cart | 담기 (body: `course_id`) |
| DELETE | /cart/{courseId} | 제거 (204) |

---

## 4. 수강·영상 진도 (enrollments) — student

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /enrollments | 내 수강 목록 (`progress_percent`, `last_video_id`, `status`, `course_title`, `thumbnail_url` 등) |
| POST | /enrollments | 수강신청 (body: `course_id`), 성공 시 장바구니에서 해당 강의 제거 |
| GET | /enrollments/{enrollmentId}/progress | 영상별 진도 `[{ video_id, last_second, completed }]` |
| PUT | /enrollments/{enrollmentId}/videos/{videoId}/progress | 진도 저장 (body: `last_second`, `completed`) |
| DELETE | /enrollments/{id} | 수강 취소 |

> 프론트는 단일 수강 상세 전용 `GET /enrollments/{id}` 대신 **목록 + `GET /courses/{id}`**로 조합해 플레이어 데이터를 구성합니다.

---

## 5. Q&A (questions) — JWT 일부

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | /courses/{courseId}/questions | JWT | 질문 등록 |
| PUT | /questions/{questionId} | JWT | 질문 수정(본인) |
| DELETE | /questions/{questionId} | JWT | 질문 삭제(본인) |
| POST | /questions/{questionId}/answers | JWT | 답변 등록 |

---

## 6. 관리자 (admin) — admin

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /admin/stats | 대시보드 통계 |
| GET | /admin/users | 전체 사용자 |
| PATCH | /admin/users/{id}/role | 역할 변경 (body: `role`) |
| GET | /admin/courses | 전체 강의(비공개 포함) |

---

## 7. 강사 (teacher) — teacher

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /teacher/dashboard | 대시보드 요약(수익은 `p2_teacher_revenue_lines` 원장 집계) |
| GET | /teacher/settlement/ledger | 수익 원장 목록 (`page`, `size`, 최대 size 100) |
| GET | /teacher/courses | 내 강의 목록 |
| POST | /teacher/courses | 강의 생성 |
| PUT | /teacher/courses/{id} | 강의 수정(커리큘럼 JSON 등) |
| DELETE | /teacher/courses/{id} | 강의 삭제 |
| POST | /teacher/courses/{id}/upload | 강의 영상 파일 업로드·연결 |
| POST | /teacher/upload/image | 이미지 업로드(범용) |
| POST | /teacher/upload/video | 영상 업로드(범용) |
| POST | /teacher/profile/banner | 프로필 배너 |
| PATCH | /teacher/profile | 프로필 텍스트·HTML 등 |

---

## 8. 피드백 (feedback) — student / teacher

| 메서드 | 경로 | 역할 | 설명 |
|--------|------|------|------|
| POST | /feedback/upload | student | 첨부 업로드 |
| POST | /feedback | student | 피드백 신청 생성 |
| GET | /feedback/mine | student | 내 목록 |
| GET | /feedback/{id} | student | 상세 |
| POST | /feedback/{id}/messages | student | 학생 메시지 추가 |
| GET | /teacher/feedback | teacher | 담당 목록 |
| GET | /teacher/feedback/{id} | teacher | 상세 |
| PATCH | /teacher/feedback/{id} | teacher | 상태·답변 갱신 |
| POST | /teacher/feedback/{id}/messages | teacher | 강사 메시지 |

---

## 9. 응답 코드

| 코드 | 의미 |
|------|------|
| 200 / 201 | 성공 |
| 204 | 삭제 등 본문 없음 |
| 400 | 검증 실패 |
| 401 | 비인증 |
| 403 | 권한 없음(역할) |
| 404 | 없음 |
| 409 | 충돌(중복 수강·장바구니 등) |

---

*구현 소스: `p2/backend/src/**/*.controller.ts`. 스키마 상세는 필요 시 OpenAPI를 확장한다.*
