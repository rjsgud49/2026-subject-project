# P1 프론트엔드 (React + Vite + JavaScript + Redux)

## 구조

```
src/
├── components/     # CourseCard, FilterSidebar, VideoPlayer, ProgressBar, Tabs, Accordion, Button …
├── pages/          # Landing, CourseList, CourseDetail, VideoPlayerPage, Dashboard, Cart …
├── features/       # Redux store + slices
├── hooks/
├── services/       # api.js, mockData.js
├── utils/
├── layouts/
├── App.jsx
└── main.jsx
```

## 실행

```bash
npm install
npm run dev
```

- API 연동: 백엔드 `http://localhost:3000` 기동 후 프록시 `/api/v1` 사용.
- **목업만**: `.env`에 `VITE_USE_MOCK=true` 설정.

## 라우트

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 |
| `/courses` | 강의 목록·필터·페이징 |
| `/courses/:id` | 상세 (소개·커리큘럼·Q&A 탭) |
| `/cart` | 장바구니 (로그인 필요) |
| `/checkout/complete` | 간이 결제 완료 |
| `/dashboard` | 내 강의실 |
| `/learn/:enrollmentId` | 영상 시청·진도·속도·전체화면 |
| `/questions/:id` | Q&A 상세·답변·본인 수정·삭제 |

로그인: `/login` — 세션에 `id: 1` 저장, API `x-user-id`와 동기화.
