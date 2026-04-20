import { DEFAULT_USER_ID, SESSION_KEY } from '../utils/constants';
import { mockHandleRequest } from './mockData';

const BASE = '/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const TOKEN_KEY = 'p2_access_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getUserId() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    if (s) {
      const u = JSON.parse(s);
      if (u?.id != null) return Number(u.id);
    }
  } catch (_) {
    /* ignore */
  }
  return DEFAULT_USER_ID;
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

function mapCourseFromP2(c) {
  if (!c) return c;
  return {
    ...c,
    instructor_name: c.instructor?.name ?? c.instructor_name ?? null,
    thumbnail_url: c.thumbnail_url ?? null,
    category: c.category ?? null,
    difficulty: c.difficulty ?? null,
    estimated_hours: c.estimated_hours ?? null,
    sections: c.sections ?? [],
    instructor_bio: c.instructor_bio ?? null,
  };
}

function mapEnrollmentFromP2(r) {
  if (!r) return r;
  const title = r.course?.title ?? r.course_title ?? '';
  return {
    ...r,
    course_title: title,
    thumbnail_url: r.thumbnail_url ?? null,
    status: r.status ?? 'active',
    progress_percent: r.progress_percent ?? 0,
    last_video_id: r.last_video_id ?? null,
  };
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
  const token = getToken();
  const headers = { ...options.headers };
  if (!(body instanceof FormData) && body != null && typeof body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (res.status === 204) return undefined;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const m = data.message;
    const msg = Array.isArray(m) ? m.join(', ') : m;
    throw new Error(msg || res.statusText || String(res.status));
  }
  return data;
}

async function requestFormData(path, formData) {
  const url = `${BASE}${path}`;
  const token = getToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (res.status === 204) return undefined;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || String(res.status));
  return data;
}

const DEMO_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export const api = {
  auth: {
    login: async ({ email, password }) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.access_token) setToken(data.access_token);
      return data.user;
    },
    signup: async ({ email, name, password, role }) => {
      const data = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, name, password, role }),
      });
      if (data?.access_token) setToken(data.access_token);
      return data.user;
    },
    me: () => request('/auth/me'),
  },
  courses: {
    list: (params) => request(`/courses${qs(params)}`),
    get: async (id) => mapCourseFromP2(await request(`/courses/${id}`)),
  },
  cart: {
    list: () => Promise.resolve([]),
    add: () => Promise.reject(new Error('p2 ë°±ì—”?œì— ?¥ë°”êµ¬ë‹ˆ APIê°€ ?†ìŠµ?ˆë‹¤.')),
    remove: () => Promise.resolve(undefined),
  },
  enrollments: {
    list: async (status) => {
      try {
        const rows = await request('/enrollments');
        const arr = Array.isArray(rows) ? rows : [];
        return arr.map(mapEnrollmentFromP2);
      } catch {
        return [];
      }
    },
    enroll: (courseId) =>
      request('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId }),
      }),
    get: async (enrollmentId) => {
      const rows = await request('/enrollments');
      const row = (Array.isArray(rows) ? rows : []).find((r) => Number(r.id) === Number(enrollmentId));
      if (!row) throw new Error('?˜ê°• ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.');
      const cid = Number(row.course_id);
      const courseRaw = await request(`/courses/${cid}`);
      const c = mapCourseFromP2(courseRaw);
      const sections =
        Array.isArray(c.sections) && c.sections.length > 0
          ? c.sections
          : [
              {
                title: 'ê°•ì˜',
                videos: [
                  {
                    id: 1,
                    title: '?Œê°œ ?ìƒ (?°ëª¨)',
                    duration: 120,
                    video_url: DEMO_VIDEO,
                  },
                ],
              },
            ];
      return {
        id: Number(row.id),
        course_id: cid,
        last_video_id: null,
        course: {
          id: cid,
          title: c.title,
          category: c.category,
          description: c.description,
          sections,
        },
      };
    },
    getProgress: () => Promise.resolve([]),
    updateProgress: () => Promise.resolve({ ok: true }),
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
      request(`/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    delete: (questionId) =>
      request(`/questions/${questionId}`, { method: 'DELETE' }),
    createAnswer: (questionId, body) =>
      request(`/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  feedback: {
    create: () =>
      Promise.reject(new Error('?´ìš©ê¶??¼ë“œë°±ì? p2 ?™ìƒ ë©”ë‰´???¼ë“œë°??”ì²­???´ìš©??ì£¼ì„¸??')),
    list: () => Promise.resolve([]),
    get: () => Promise.resolve(null),
  },
};
