/** 오프라인·VITE_USE_MOCK=true 시 사용 (SRS·UI 스펙에 맞는 샘플) */

export const MOCK_COURSES_LIST = {
  items: [
    {
      id: 1,
      title: 'React 기술면접 실전 대비',
      instructor_name: '김민준',
      category: '기술면접',
      difficulty: '중급',
      price: 89000,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: '인성면접 답변 구조화 마스터',
      instructor_name: '이서연',
      category: '인성면접',
      difficulty: '초급',
      price: 0,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'PT 면접 10분 스피치',
      instructor_name: '박준형',
      category: 'PT면접',
      difficulty: '고급',
      price: 129000,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
    },
  ],
  total: 3,
  page: 1,
  size: 12,
};

export const MOCK_COURSE_DETAIL = {
  id: 1,
  title: 'React 기술면접 실전 대비',
  description:
    '프론트엔드 기술면접에서 자주 나오는 React·Hooks·성능 최적화 주제를 실전 질문과 함께 다룹니다.',
  instructor_name: '김민준',
  instructor_bio: '네이버 출신 시니어 프론트엔드 개발자. 8년차.',
  category: '기술면접',
  difficulty: '중급',
  price: 89000,
  thumbnail_url: null,
  estimated_hours: 12,
  sections: [
    {
      id: 1,
      title: '1. React 기초',
      videos: [
        { id: 1, title: 'Virtual DOM과 Reconciliation', duration_seconds: 600, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 2, title: 'Hooks useState·useEffect', duration_seconds: 900, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      ],
    },
    {
      id: 2,
      title: '2. 실전 질문',
      videos: [{ id: 3, title: '클로저와 useCallback', duration_seconds: 720, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    },
  ],
};

export let mockCart = [];
export let mockEnrollments = [];
const mockQuestionById = {};
let mockQuestionId = 100;

export function mockReset() {
  mockCart = [];
  mockEnrollments = [];
  Object.keys(mockQuestionById).forEach((k) => delete mockQuestionById[k]);
  mockQuestionId = 100;
}

export function mockHandleRequest(method, path, body, userId) {
  const json = typeof body === 'string' && body ? JSON.parse(body) : body || {};

  if (path === '/courses' || path.startsWith('/courses?')) {
    return Promise.resolve({ ...MOCK_COURSES_LIST, page: 1, size: 12 });
  }
  const courseMatch = path.match(/^\/courses\/(\d+)$/);
  if (courseMatch && method === 'GET') {
    const id = Number(courseMatch[1]);
    if (id === 1) return Promise.resolve({ ...MOCK_COURSE_DETAIL, id: 1 });
    return Promise.resolve({
      ...MOCK_COURSE_DETAIL,
      id,
      title: `샘플 강의 #${id}`,
      price: id * 10000,
    });
  }
  if (path === '/cart' && method === 'GET') {
    return Promise.resolve([...mockCart]);
  }
  if (path === '/cart' && method === 'POST') {
    const cid = json.course_id;
    if (mockCart.some((x) => x.course_id === cid)) {
      return Promise.reject(new Error('이미 장바구니에 있습니다.'));
    }
    mockCart.push({
      id: mockCart.length + 1,
      course_id: cid,
      course_title: MOCK_COURSES_LIST.items.find((c) => c.id === cid)?.title || `강의 ${cid}`,
      price: MOCK_COURSES_LIST.items.find((c) => c.id === cid)?.price ?? 0,
    });
    return Promise.resolve({});
  }
  const delCart = path.match(/^\/cart\/(\d+)$/);
  if (delCart && method === 'DELETE') {
    mockCart = mockCart.filter((x) => x.course_id !== Number(delCart[1]));
    return Promise.resolve(undefined);
  }
  if ((path === '/enrollments' || path.startsWith('/enrollments?')) && method === 'GET') {
    return Promise.resolve([...mockEnrollments]);
  }
  if (path === '/enrollments' && method === 'POST') {
    const cid = json.course_id;
    if (mockEnrollments.some((e) => e.course_id === cid)) {
      return Promise.reject(new Error('이미 수강 중입니다.'));
    }
    const enr = {
      id: mockEnrollments.length + 1,
      course_id: cid,
      course_title: MOCK_COURSES_LIST.items.find((c) => c.id === cid)?.title || `강의 ${cid}`,
      thumbnail_url: null,
      progress_percent: 0,
      status: 'active',
      last_video_id: null,
      last_second: 0,
    };
    mockEnrollments.push(enr);
    mockCart = mockCart.filter((x) => x.course_id !== cid);
    return Promise.resolve({ id: enr.id });
  }
  const enrMatch = path.match(/^\/enrollments\/(\d+)$/);
  if (enrMatch && method === 'GET') {
    const eid = Number(enrMatch[1]);
    const enr = mockEnrollments.find((e) => e.id === eid);
    if (!enr) return Promise.reject(new Error('Not found'));
    return Promise.resolve({
      ...enr,
      course: { ...MOCK_COURSE_DETAIL, id: enr.course_id, title: enr.course_title },
      last_video_id: enr.last_video_id,
    });
  }
  const progMatch = path.match(/^\/enrollments\/(\d+)\/progress$/);
  if (progMatch && method === 'GET') {
    return Promise.resolve([]);
  }
  const updProg = path.match(/^\/enrollments\/(\d+)\/videos\/(\d+)\/progress$/);
  if (updProg && method === 'PUT') {
    return Promise.resolve(undefined);
  }
  const qList = path.match(/^\/courses\/(\d+)\/questions/);
  if (qList && method === 'GET') {
    const cid = Number(qList[1]);
    const items = Object.values(mockQuestionById)
      .filter((x) => x.question.course_id === cid)
      .map((x) => ({
        id: x.question.id,
        title: x.question.title,
        user_name: x.question.user_name,
        answer_count: x.answers.length,
        created_at: x.question.created_at,
      }));
    return Promise.resolve({ items, total: items.length });
  }
  const qCreate = path.match(/^\/courses\/(\d+)\/questions$/);
  if (qCreate && method === 'POST') {
    const cid = Number(qCreate[1]);
    const id = ++mockQuestionId;
    const q = {
      id,
      course_id: cid,
      title: json.title,
      body: json.body,
      user_id: userId,
      user_name: '나',
      created_at: new Date().toISOString(),
    };
    mockQuestionById[id] = { question: q, answers: [] };
    return Promise.resolve(q);
  }
  const qGet = path.match(/^\/questions\/(\d+)$/);
  if (qGet && method === 'GET') {
    const qid = Number(qGet[1]);
    const row = mockQuestionById[qid];
    if (!row) return Promise.reject(new Error('Not found'));
    return Promise.resolve({
      question: {
        id: row.question.id,
        course_id: row.question.course_id,
        title: row.question.title,
        body: row.question.body,
        user_id: row.question.user_id,
        user_name: row.question.user_name,
        created_at: row.question.created_at,
      },
      answers: row.answers,
    });
  }
  if (qGet && method === 'PUT') {
    const qid = Number(qGet[1]);
    const row = mockQuestionById[qid];
    if (!row) return Promise.reject(new Error('Not found'));
    if (row.question.user_id !== userId) return Promise.reject(new Error('Forbidden'));
    if (json.title) row.question.title = json.title;
    if (json.body) row.question.body = json.body;
    return Promise.resolve({});
  }
  if (qGet && method === 'DELETE') {
    const qid = Number(qGet[1]);
    const row = mockQuestionById[qid];
    if (!row) return Promise.reject(new Error('Not found'));
    if (row.question.user_id !== userId) return Promise.reject(new Error('Forbidden'));
    delete mockQuestionById[qid];
    return Promise.resolve(undefined);
  }
  const ans = path.match(/^\/questions\/(\d+)\/answers$/);
  if (ans && method === 'POST') {
    const qid = Number(ans[1]);
    const row = mockQuestionById[qid];
    if (row) {
      row.answers.push({
        id: row.answers.length + 1,
        body: json.body,
        user_name: '답변자',
        created_at: new Date().toISOString(),
      });
    }
    return Promise.resolve({});
  }
  return Promise.reject(new Error(`Mock: unhandled ${method} ${path}`));
}
