export const USER_ID_HEADER = 'x-user-id';
export const DEFAULT_USER_ID = 1;
export const SESSION_KEY = 'p1_session';

// 1단계: 면접 방식
export const INTERVIEW_TYPES = [
  '기술면접', '인성면접', 'PT면접', '영어면접', '그룹면접',
];

// 2단계: 직무/분야
export const JOB_FIELDS = [
  { group: 'IT개발', items: ['웹/프론트엔드', '백엔드/서버', '알고리즘/자료구조', '데이터베이스', '시스템설계', 'DevOps/클라우드', '데이터/AI', '모바일(Android/iOS)', '보안/네트워크', 'CS기초'] },
  { group: '기타 직무', items: ['금융/은행', '마케팅/광고', '영업', '의료/간호', '공무원/공기업', '교육/강사', '디자인', '경영/기획', '법률/회계'] },
];

// 하위 호환용 flat 배열
export const CATEGORIES = [
  ...INTERVIEW_TYPES,
  ...JOB_FIELDS.flatMap((g) => g.items),
];
export const DIFFICULTIES = ['초급', '중급', '고급'];
export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'popular', label: '인기순' },
];
