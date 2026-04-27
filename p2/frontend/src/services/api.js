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
    instructor_profile_html: c.instructor_profile_html ?? null,
    instructor_banner_url: c.instructor_banner_url ?? null,
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
  if (!res.ok) {
    const m = data.message;
    const msg = Array.isArray(m) ? m.join(', ') : m;
    throw new Error(msg || res.statusText || String(res.status));
  }
  return data;
}

/** /feedback/new(이용권) 제목 형식: [플랜] 직무 · 유형 — mine 응답을 신청 내역 카드용으로 변환 */
function mapFeedbackMineToSubmission(r) {
  const title = r.title || '';
  const m = title.match(/^\[([^\]]+)\]\s*(.+?)\s*\u00b7\s*(.+)$/);
  let planName = title || '피드백';
  let jobCategory = '—';
  let feedbackType = '—';
  let planId = 'doc';
  if (m) {
    planName = m[1].trim();
    jobCategory = m[2].trim();
    feedbackType = m[3].trim();
    if (/영상/.test(planName)) planId = 'video';
    else if (/심층/.test(planName)) planId = 'premium';
    else planId = 'doc';
  }
  const q = r.student_question || '';
  let note = q.trim() || null;
  if (q.includes('[피드백 유형]')) {
    const parts = q.split('\n\n');
    if (parts.length > 1) note = parts[parts.length - 1].trim() || null;
  }
  const atts = Array.isArray(r.student_attachments) ? r.student_attachments : [];
  const fileNames = atts.map((a) => (a && a.filename ? String(a.filename) : '')).filter(Boolean);
  let status = r.status;
  if (status === 'answered') status = 'completed';
  if (!['pending', 'in_progress', 'completed'].includes(status)) status = 'pending';
  const thread = Array.isArray(r.thread)
    ? r.thread.filter(
        (x) =>
          x &&
          typeof x === 'object' &&
          (x.role === 'student' || x.role === 'teacher') &&
          typeof x.body === 'string' &&
          typeof x.at === 'string',
      )
    : [];
  return {
    id: Number(r.id),
    planId,
    planName,
    jobCategory,
    feedbackType,
    note,
    fileNames,
    status,
    createdAt: r.created_at || new Date().toISOString(),
    thread,
  };
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
    add: () => Promise.reject(new Error('p2 백엔드에는 장바구니 API가 없습니다.')),
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
      if (!row) throw new Error('수강 정보를 찾을 수 없습니다.');
      const cid = Number(row.course_id);
      const courseRaw = await request(`/courses/${cid}`);
      const c = mapCourseFromP2(courseRaw);
      const sections =
        Array.isArray(c.sections) && c.sections.length > 0
          ? c.sections
          : [
              {
                title: '강의',
                videos: [
                  {
                    id: 1,
                    title: '소개 영상 (데모)',
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
    /** 학생 첨부 1건 업로드 → 백엔드 검증 후 /api/v1/files/... URL */
    uploadStudentFile: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('originalFilename', file.name);
      return requestFormData('/feedback/upload', fd);
    },
    /**
     * /feedback/new 폼: { planId, jobCategory, feedbackType, note, files }
     * 백엔드 CreateFeedbackDto(title, question, attachments)로 매핑
     */
    create: async (payload) => {
      const planId = payload.planId;
      const jobCategory = payload.jobCategory;
      const feedbackType = payload.feedbackType;
      const note = payload.note ?? '';
      const files = Array.isArray(payload.files) ? payload.files : [];
      const PLAN_NAMES = { doc: '문서 피드백', video: '영상 피드백', premium: '심층 피드백' };
      const planName = PLAN_NAMES[planId] || String(planId || '피드백');
      const title = `[${planName}] ${jobCategory} · ${feedbackType}`.slice(0, 200);
      const questionParts = [
        `[이용권] ${planName} (${planId})`,
        `[직무] ${jobCategory}`,
        `[피드백 유형] ${feedbackType}`,
        '',
        note.trim() || '(요청 사항 없음)',
      ];
      let question = questionParts.join('\n');
      if (question.length < 5) question = question.padEnd(5, '·');

      const attachments = [];
      for (const file of files.slice(0, 8)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('originalFilename', file.name);
        const up = await requestFormData('/feedback/upload', fd);
        attachments.push({
          url: up.url,
          filename: String(up.filename || file.name).slice(0, 255),
        });
      }

      const body = {
        title,
        question,
        ...(attachments.length ? { attachments } : {}),
      };
      return request('/feedback', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    list: async () => {
      const rows = await request('/feedback/mine');
      const arr = Array.isArray(rows) ? rows : [];
      return arr.map(mapFeedbackMineToSubmission);
    },
    get: (id) => request(`/feedback/${id}`),
    addMessage: (id, body) =>
      request(`/feedback/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
  },
};
