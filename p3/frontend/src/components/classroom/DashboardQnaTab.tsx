import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import Button from '../Button';
import EmptyState from '../EmptyState';

type QnaItem = {
  id: number;
  title: string;
  user_name: string;
  answer_count: number;
  created_at: string;
};

type CourseQnaGroup = {
  courseId: number;
  courseTitle: string;
  items: QnaItem[];
};

type EnrollmentItem = {
  course_id: number;
  course_title?: string | null;
};

export default function DashboardQnaTab({ enrollments }: { enrollments: EnrollmentItem[] }) {
  const [groups, setGroups] = useState<CourseQnaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<number | 'all'>('all');

  const uniqueCourses = useMemo(() => {
    const map = new Map<number, string>();
    for (const e of enrollments) {
      if (!map.has(e.course_id)) {
        map.set(e.course_id, e.course_title ?? `강의 #${e.course_id}`);
      }
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [enrollments]);

  useEffect(() => {
    if (!uniqueCourses.length) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      uniqueCourses.map(async (c) => {
        try {
          const res = await api.questions.list(c.id, 1, 50);
          return { courseId: c.id, courseTitle: c.title, items: res.items ?? [] };
        } catch {
          return { courseId: c.id, courseTitle: c.title, items: [] as QnaItem[] };
        }
      }),
    )
      .then(setGroups)
      .finally(() => setLoading(false));
  }, [uniqueCourses]);

  const visibleGroups = useMemo(() => {
    if (courseFilter === 'all') return groups;
    return groups.filter((g) => g.courseId === courseFilter);
  }, [groups, courseFilter]);

  const totalCount = useMemo(
    () => visibleGroups.reduce((sum, g) => sum + g.items.length, 0),
    [visibleGroups],
  );

  if (!enrollments.length) {
    return (
      <EmptyState
        title="수강 중인 강의가 없어요"
        description="수강 중인 강의의 Q&A를 여기서 모아볼 수 있습니다."
        action={
          <Link to="/courses">
            <Button>강의 둘러보기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 600 }}>Q&amp;A</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)' }}>
            수강 중인 강의 질문을 한곳에서 확인합니다.
          </p>
        </div>
        {courseFilter !== 'all' && (
          <Link to={`/courses/${courseFilter}/questions/new`} style={{ textDecoration: 'none' }}>
            <Button size="sm">질문하기</Button>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button type="button" onClick={() => setCourseFilter('all')} style={pillStyle(courseFilter === 'all')}>
          전체
        </button>
        {uniqueCourses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCourseFilter(c.id)}
            style={pillStyle(courseFilter === c.id)}
          >
            {c.title}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>불러오는 중…</p>}

      {!loading && totalCount === 0 && (
        <EmptyState
          title="등록된 질문이 없어요"
          description="강의 내용이 궁금하면 Q&A에 질문을 남겨보세요."
          action={
            courseFilter !== 'all' ? (
              <Link to={`/courses/${courseFilter}/questions/new`}>
                <Button>질문하기</Button>
              </Link>
            ) : uniqueCourses[0] ? (
              <Link to={`/courses/${uniqueCourses[0].id}/questions/new`}>
                <Button>질문하기</Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {!loading &&
        visibleGroups.map((g) =>
          g.items.length === 0 ? null : (
            <section key={g.courseId} style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{g.courseTitle}</h3>
                <Link
                  to={`/courses/${g.courseId}/questions/new`}
                  style={{ fontSize: 13, color: 'var(--color-primary-600)', fontWeight: 600 }}
                >
                  + 질문하기
                </Link>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {g.items.map((q) => (
                  <li
                    key={q.id}
                    style={{
                      padding: 14,
                      border: '1px solid var(--color-neutral-200)',
                      borderRadius: 12,
                      background: 'var(--color-neutral-0)',
                    }}
                  >
                    <Link
                      to={`/questions/${q.id}`}
                      style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-neutral-800)' }}
                    >
                      {q.title}
                    </Link>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--color-neutral-500)' }}>
                      {q.user_name} · 답변 {q.answer_count} ·{' '}
                      {new Date(q.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ),
        )}
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    height: 32,
    padding: '0 14px',
    borderRadius: 999,
    border: active ? 'none' : '1px solid var(--color-neutral-200)',
    background: active ? 'var(--color-neutral-900)' : 'var(--color-neutral-0)',
    color: active ? '#fff' : 'var(--color-neutral-700)',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
