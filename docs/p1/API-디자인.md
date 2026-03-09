# API 디자인 (P1)

## 1. 원칙

- **REST**: 자원(명사) 기준 URL, HTTP 메서드로 행위 표현
- **버전**: `/api/v1` prefix로 버전 관리
- **일관성**: 목록은 복수형(`/courses`), 상세는 `/{id}`

---

## 2. URL 구조

| 자원 | 목록 | 상세 | 하위 자원 예 |
|------|------|------|--------------|
| 강의 | GET /courses | GET /courses/{id} | GET /courses/{id}/questions |
| 장바구니 | GET /cart | - | DELETE /cart/{courseId} |
| 수강 | GET /enrollments | GET /enrollments/{id} | GET /enrollments/{id}/progress |
| 진도 | - | - | PUT /enrollments/{id}/videos/{videoId}/progress |
| 질문 | GET /courses/{id}/questions | GET /questions/{id} | POST /questions/{id}/answers |

---

## 3. HTTP 메서드·응답 코드

| 메서드 | 용도 | 성공 코드 |
|--------|------|-----------|
| GET | 조회 | 200 |
| POST | 생성(수강신청, 장바구니 담기, 질문/답변 등록) | 201 |
| PUT | 수정(진도, 질문 수정) | 200 |
| DELETE | 삭제(장바구니 제거, 질문 삭제) | 204 |

- **400**: 잘못된 요청(파라미터 오류)
- **401**: 비인증 (P2에서 본격 사용)
- **403**: 권한 없음 (본인 글만 수정/삭제 등)
- **404**: 자원 없음
- **409**: 충돌 (이미 수강 중, 장바구니 중복 등)

---

## 4. 페이징

- **쿼리**: `page`, `size` (또는 `offset`, `limit`)
- **응답**: `items`, `total`, `page`, `size` 포함

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 12
}
```

---

## 5. 검색·필터·정렬

- **검색**: `q` (키워드)
- **필터**: `category`, `difficulty`, `min_price`, `max_price`
- **정렬**: `sort=latest|price_asc|price_desc|popular`

OpenAPI 상세는 `api.yml` 참고.
