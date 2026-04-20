const BASE = '/api/v1';

const TOKEN_KEY = 'p2_access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const h = new Headers(headers);
  const isForm = rest.body instanceof FormData;
  if (!isForm && !h.has('Content-Type') && rest.body && typeof rest.body === 'string') {
    h.set('Content-Type', 'application/json');
  }
  if (auth) {
    const t = getToken();
    if (t) h.set('Authorization', `Bearer ${t}`);
  }
  const res = await fetch(`${BASE}${path}`, { ...rest, headers: h });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as {
    message?: string | string[];
  };
  if (!res.ok) {
    const m = data.message;
    const msg = Array.isArray(m) ? m.join(', ') : m;
    throw new Error(msg || res.statusText || String(res.status));
  }
  return data as T;
}

export type UserRole = 'admin' | 'teacher' | 'student';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  bio?: string | null;
  /** 강사 정산계좌 (본인 조회·수정 시에만) */
  settlement_bank?: string | null;
  settlement_account_no?: string | null;
  settlement_holder?: string | null;
};

export type LoginResponse = { access_token: string; user: AuthUser };

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
        auth: false,
      }),
    signup: (body: { email: string; name: string; password: string; role?: 'student' | 'teacher' }) =>
      apiRequest<LoginResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
        auth: false,
      }),
    me: () => apiRequest<AuthUser>('/auth/me'),
  },
  courses: {
    list: (page = 1, size = 12) =>
      apiRequest<{ items: CoursePublic[]; total: number; page: number; size: number }>(
        `/courses?page=${page}&size=${size}`,
        { auth: false },
      ),
    get: (id: number) => apiRequest<CoursePublic>(`/courses/${id}`, { auth: false }),
  },
  admin: {
    stats: () => apiRequest<AdminStats>('/admin/stats'),
    users: () => apiRequest<AuthUser[]>('/admin/users'),
    updateRole: (id: number, role: UserRole) =>
      apiRequest<AuthUser>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    courses: () => apiRequest<AdminCourseRow[]>('/admin/courses'),
  },
  teacher: {
    dashboard: () => apiRequest<TeacherDashboard>('/teacher/dashboard'),
    courses: () => apiRequest<TeacherCourse[]>('/teacher/courses'),
    createCourse: (body: {
      title: string;
      description?: string;
      price: number;
      isPublished?: boolean;
      curriculum?: Record<string, unknown>;
      thumbnail_url?: string;
    }) =>
      apiRequest<TeacherCourse>('/teacher/courses', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateCourse: (
      id: number,
      body: Partial<{
        title: string;
        description: string;
        price: number;
        isPublished: boolean;
        curriculum: Record<string, unknown>;
        thumbnail_url: string;
      }>,
    ) =>
      apiRequest<TeacherCourse>(`/teacher/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    uploadCourseFile: (courseId: number, file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiRequest<{ url: string; filename: string; stored: string }>(
        `/teacher/courses/${courseId}/upload`,
        { method: 'POST', body: fd },
      );
    },
    deleteCourse: (id: number) =>
      apiRequest<{ ok: boolean }>(`/teacher/courses/${id}`, { method: 'DELETE' }),
    updateProfile: (body: {
      name?: string;
      bio?: string;
      settlement_bank?: string;
      settlement_account_no?: string;
      settlement_holder?: string;
    }) =>
      apiRequest<AuthUser>('/teacher/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },
  enrollments: {
    list: () => apiRequest<EnrollmentRow[]>('/enrollments'),
    enroll: (course_id: number) =>
      apiRequest<EnrollmentRow>('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ course_id }),
      }),
    remove: (id: number) =>
      apiRequest<{ ok: boolean }>(`/enrollments/${id}`, { method: 'DELETE' }),
  },
  feedback: {
    mine: () => apiRequest<FeedbackRow[]>('/feedback/mine'),
    uploadStudentFile: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiRequest<{ url: string; filename: string; stored: string }>('/feedback/upload', {
        method: 'POST',
        body: fd,
      });
    },
    create: (body: {
      title: string;
      question: string;
      attachments?: FeedbackAttachmentRef[];
    }) =>
      apiRequest<FeedbackRow>('/feedback', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  teacherFeedback: {
    list: () => apiRequest<FeedbackRow[]>('/teacher/feedback'),
    get: (id: number) => apiRequest<FeedbackRow>(`/teacher/feedback/${id}`),
    update: (
      id: number,
      body: Partial<{
        status: 'pending' | 'in_progress' | 'answered';
        teacherQuestion: string;
        teacherFeedback: string;
      }>,
    ) =>
      apiRequest<FeedbackRow>(`/teacher/feedback/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },
};

export type FeedbackAttachmentRef = { url: string; filename: string };

export type TeacherDashboardCourseRow = {
  id: number;
  title: string;
  is_published: boolean;
  price: number;
  view_count: number;
  enrollment_count: number;
  gross_revenue: number;
  platform_fee: number;
  net_revenue: number;
};

export type TeacherDashboard = {
  platform_fee_rate: number;
  totals: {
    gross_revenue: number;
    platform_fee: number;
    net_revenue: number;
    total_enrollments: number;
    total_views: number;
  };
  courses: TeacherDashboardCourseRow[];
};

export type CoursePublic = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  is_published: boolean;
  view_count?: number;
  instructor: { id: number; name: string; email: string } | null;
  created_at: string;
  instructor_name?: string | null;
  instructor_bio?: string | null;
  thumbnail_url?: string | null;
  sections?: unknown[];
  category?: string | null;
  difficulty?: string | null;
  estimated_hours?: number | null;
};

export type TeacherCourse = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  is_published: boolean;
  created_at: string;
  curriculum?: Record<string, unknown> | null;
  thumbnail_url?: string | null;
  view_count?: number;
};

export type AdminStats = {
  users: number;
  courses: number;
  enrollments: number;
  byRole: { admin: number; teacher: number; student: number };
};

export type AdminCourseRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  is_published: boolean;
  instructor_id: number;
  instructor: { id: number; name: string; email: string } | null;
  created_at: string;
};

export type EnrollmentRow = {
  id: number;
  course_id: number;
  enrolled_at: string;
  course: {
    id: number;
    title: string;
    price: number;
    instructor: { id: number; name: string } | null;
  } | null;
};

export type FeedbackRow = {
  id: number;
  title: string;
  student_question: string;
  student_attachments?: FeedbackAttachmentRef[];
  teacher_question: string | null;
  teacher_feedback: string | null;
  status: 'pending' | 'in_progress' | 'answered';
  student_id: number;
  teacher_id: number | null;
  student_name: string | null;
  teacher_name: string | null;
  created_at: string;
  updated_at: string;
};
