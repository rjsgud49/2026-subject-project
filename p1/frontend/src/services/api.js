import { DEFAULT_USER_ID, SESSION_KEY, USER_ID_HEADER } from '../utils/constants';
import { mockHandleRequest } from './mockData';

const BASE = '/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function getUserId() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    if (s) {
      const u = JSON.parse(s);
      if (u?.id != null) return Number(u.id);
    }
  } catch (_) {}
  return DEFAULT_USER_ID;
}

async function request(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;

  if (USE_MOCK) {
    const q = path.includes('?') ? path.slice(path.indexOf('?')) : '';
    const clean = path.startsWith(BASE) ? path.slice(BASE.length) || '/' : path;
    const mockPath = clean + q;
    return mockHandleRequest(method, mockPath, body, getUserId());
  }

  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      [USER_ID_HEADER]: String(getUserId()),
      ...options.headers,
    },
  });
  if (res.status === 204) return undefined;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || String(res.status));
  return data;
}

function qs(params) {
  if (!params) return '';
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v != null) p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const api = {
  auth: {
    login: ({ email, password }) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        // 로그인 요청은 아직 세션이 없을 수 있어도 동작해야 하므로 header는 기본값으로 무방
      }),
    signup: ({ email, name, password }) =>
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      }),
    me: () => request('/auth/me'),
  },
  courses: {
    list: (params) => request(`/courses${qs(params)}`),
    get: (id) => request(`/courses/${id}`),
  },
  cart: {
    list: () => request('/cart'),
    add: (courseId) =>
      request('/cart', { method: 'POST', body: JSON.stringify({ course_id: courseId }) }),
    remove: (courseId) => request(`/cart/${courseId}`, { method: 'DELETE' }),
  },
  enrollments: {
    list: (status) => request(`/enrollments${status ? `?status=${status}` : ''}`),
    enroll: (courseId) =>
      request('/enrollments', { method: 'POST', body: JSON.stringify({ course_id: courseId }) }),
    get: (id) => request(`/enrollments/${id}`),
    getProgress: (enrollmentId) => request(`/enrollments/${enrollmentId}/progress`),
    updateProgress: (enrollmentId, videoId, body) =>
      request(`/enrollments/${enrollmentId}/videos/${videoId}/progress`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },
  questions: {
    list: (courseId, page = 1, size = 20) =>
      request(`/courses/${courseId}/questions?page=${page}&size=${size}`),
    get: (questionId) => request(`/questions/${questionId}`),
    create: (courseId, body) =>
      request(`/courses/${courseId}/questions`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (questionId, body) =>
      request(`/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (questionId) => request(`/questions/${questionId}`, { method: 'DELETE' }),
    createAnswer: (questionId, body) =>
      request(`/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
};
