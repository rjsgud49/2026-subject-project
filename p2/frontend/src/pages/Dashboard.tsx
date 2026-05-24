import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchEnrollments, setEnrollmentFilter, setEnrollmentSort } from '../features/enrollmentSlice';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import CourseThumbnail from '../components/CourseThumbnail';
import Tabs from '../components/Tabs';
import DashboardNotesTab from '../components/classroom/DashboardNotesTab';
import DashboardQnaTab from '../components/classroom/DashboardQnaTab';

type ClassroomTab = 'lectures' | 'notes' | 'qna';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { list, filter, sort } = useAppSelector((s) => s.enrollment);
  const [chapter, setChapter] = useState<ClassroomTab>('lectures');

  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let rows = [...(list || [])];
    if (filter === 'active') rows = rows.filter((e: { status?: string }) => e.status !== 'completed');
    if (filter === 'completed') rows = rows.filter((e: { status?: string }) => e.status === 'completed');
    if (sort === 'title') {
      rows.sort((a: { course_title?: string }, b: { course_title?: string }) =>
        (a.course_title || '').localeCompare(b.course_title || ''),
      );
    }
    return rows;
  }, [list, filter, sort]);

  const enrollmentItems = useMemo(
    () =>
      (list || []).map((e: { id: number; course_id: number; course_title?: string }) => ({
        id: e.id,
        course_id: e.course_id,
        course_title: e.course_title,
      })),
    [list],
  );

  const chapterTabs = [
    { id: 'lectures', label: '강의' },
    { id: 'notes', label: '학습노트' },
    { id: 'qna', label: 'Q&A' },
  ];

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>
          내 강의실
        </h1>
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 14 }}>
          수강 강의 · 학습 노트 · Q&amp;A를 한곳에서 관리합니다.
        </p>
      </div>

      <Tabs tabs={chapterTabs} active={chapter} onChange={(id) => setChapter(id as ClassroomTab)} />

      {chapter === 'lectures' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => dispatch(setEnrollmentFilter(f))}
                  style={{
                    height: 32,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: filter === f ? 600 : 400,
                    cursor: 'pointer',
                    background: filter === f ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                    color: filter === f ? '#fff' : 'var(--color-neutral-600)',
                    transition: 'background 150ms, color 150ms',
                    fontFamily: 'inherit',
                  }}
                >
                  {f === 'all' ? '전체' : f === 'active' ? '수강 중' : '수료'}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => dispatch(setEnrollmentSort(e.target.value))}
              className="ui-select"
              style={{ width: 150, marginLeft: 'auto', height: 32, fontSize: 13 }}
            >
              <option value="recent">최근 수강순</option>
              <option value="title">제목순</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="수강 중인 강의가 없어요"
              description="마음에 드는 강의를 찾아 시작해보세요."
              action={
                <Link to="/courses">
                  <Button>강의 둘러보기</Button>
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filtered.map((e: Record<string, unknown>, idx: number) => (
                <div
                  key={String(e.id)}
                  style={{
                    background: 'var(--color-neutral-0)',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: 140, flexShrink: 0, position: 'relative' }}>
                    <CourseThumbnail
                      src={e.thumbnail_url as string | undefined}
                      id={(e.course_id as number) ?? idx}
                      title={e.course_title as string}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background:
                          e.status === 'completed' ? 'var(--color-success-600)' : 'var(--color-primary-600)',
                        color: '#fff',
                      }}
                    >
                      {e.status === 'completed' ? '수료' : '수강 중'}
                    </span>
                  </div>

                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--color-neutral-800)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        flex: 1,
                      }}
                    >
                      {e.course_title as string}
                    </h3>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>진도</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-600)' }}>
                          {(e.progress_percent as number) ?? 0}%
                        </span>
                      </div>
                      <ProgressBar value={(e.progress_percent as number) ?? 0} max={100} />
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/learn/${e.id}`} style={{ flex: 1 }}>
                        <Button size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                          {e.last_video_id ? '이어보기' : '학습 시작'}
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => setChapter('qna')}
                      >
                        Q&amp;A
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {chapter === 'notes' && <DashboardNotesTab enrollments={enrollmentItems} />}
      {chapter === 'qna' && <DashboardQnaTab enrollments={enrollmentItems} />}
    </div>
  );
}
