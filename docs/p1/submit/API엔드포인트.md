# API 엔드포인트 - 면접 인강 플랫폼 P1

**제출 문서: API 엔드포인트**  
- 요약: 본 문서  
- 상세 스펙: OpenAPI 3.0 — [api.yml](./api.yml)

**Base URL**: `/api/v1` (권장)

---

## 1. 강의 (courses)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /courses | 강의 목록 검색 (q, category, difficulty, min_price, max_price, sort, page, size) |
| GET | /courses/{courseId} | 강의 상세 (커리큘럼 포함) |

---

## 2. 장바구니 (cart)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /cart | 장바구니 목록 |
| POST | /cart | 장바구니 담기 (body: course_id) |
| DELETE | /cart/{courseId} | 장바구니에서 제거 |

---

## 3. 수강신청·내 수업 (enrollments)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /enrollments | 내 수업 목록 (진도율·수료 포함, query: status) |
| POST | /enrollments | 수강신청 (body: course_id) |
| GET | /enrollments/{enrollmentId} | 수강 상세 (이어보기용) |

---

## 4. 영상 진도 (progress)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /enrollments/{enrollmentId}/progress | 강의별 영상 진도 목록 |
| PUT | /enrollments/{enrollmentId}/videos/{videoId}/progress | 진도 저장 (body: last_second, completed) |

---

## 5. Q&A (질문·답변)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /courses/{courseId}/questions | 강의별 질문 목록 (page, size) |
| POST | /courses/{courseId}/questions | 질문 등록 (body: title, body, is_private) |
| GET | /questions/{questionId} | 질문 상세 + 답변 목록 |
| PUT | /questions/{questionId} | 질문 수정 (본인만, body: title, body) |
| DELETE | /questions/{questionId} | 질문 삭제 (본인만) |
| POST | /questions/{questionId}/answers | 답변 등록 (body: body) |

---

## 6. 응답 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 (조회·수정) |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (본문 없음) |
| 400 | 잘못된 요청 |
| 401 | 비인증 (P2에서 본격 사용) |
| 403 | 권한 없음 |
| 404 | 자원 없음 |
| 409 | 충돌 (이미 수강 중, 장바구니 중복 등) |

---

*상세 요청/응답 스키마는 [api.yml](./api.yml) 참조.*
