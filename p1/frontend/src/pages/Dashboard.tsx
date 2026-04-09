import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchEnrollments, setEnrollmentFilter, setEnrollmentSort } from '../features/enrollmentSlice';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import CourseThumbnail from '../components/CourseThumbnail';
import { Ticket, FileText, Video, Award, BookOpen } from 'lucide-react';

const PLAN_META = [
  { id: 'doc' as const,     name: '문서',  Icon: FileText, color: 'var(--color-primary-600)',  bg: 'var(--color-primary-50)' },
  { id: 'video' as const,   name: '영상',  Icon: Video,    color: 'var(--color-success-600)',  bg: 'var(--color-success-50)' },
  { id: 'premium' as const, name: '심층',  Icon: Award,    color: '#7c3aed',                  bg: '#f5f3ff' },
];


export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { list, filter, sort } = useAppSelector((s) => s.enrollment);
  const user = useAppSelector((s) => s.user.user);
  const { tickets } = useFeedbackTickets(!!user);
  const totalTickets = tickets.doc + tickets.video + tickets.premium;

  useEffect(() => { dispatch(fetchEnrollments()); }, [dispatch]);

  const filtered = useMemo(() => {
    let rows = [...(list || [])];
    if (filter === 'active') rows = rows.filter((e: any) => e.status !== 'completed');
    if (filter === 'completed') rows = rows.filter((e: any) => e.status === 'completed');
    if (sort === 'title') rows.sort((a: any, b: any) => (a.course_title || '').localeCompare(b.course_title || ''));
    return rows;
  }, [list, filter, sort]);

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 24px' }}>

      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>내 강의실</h1>
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 14 }}>수강 중인 강의와 진도를 확인하세요.</p>
      </div>

      {/* 피드백 이용권 배너 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          background: totalTickets > 0 ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
          border: `1px solid ${totalTickets > 0 ? 'var(--color-primary-200)' : 'var(--color-neutral-200)'}`,
          borderRadius: 'var(--radius-lg)',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ticket size={18} color="var(--color-primary-500)" />
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-neutral-800)' }}>피드백 이용권</span>
            {totalTickets > 0 && (
              <span style={{ background: 'var(--color-primary-500)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
                총 {totalTickets}회 보유
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {PLAN_META.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                <p.Icon size={13} color={tickets[p.id] > 0 ? p.color : 'var(--color-neutral-400)'} />
                <span style={{ color: 'var(--color-neutral-500)' }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: tickets[p.id] > 0 ? p.color : 'var(--color-neutral-400)', background: tickets[p.id] > 0 ? p.bg : 'var(--color-neutral-100)', padding: '1px 8px', borderRadius: 'var(--radius-full)', fontSize: 12 }}>
                  {tickets[p.id]}회
                </span>
              </div>
            ))}
          </div>
        </div>
        <Link to="/feedback">
          <Button variant={totalTickets > 0 ? 'primary' : 'secondary'} size="sm">
            {totalTickets > 0 ? '이용권 사용하기' : '이용권 구매하기'}
          </Button>
        </Link>
      </div>

      {/* 필터 + 정렬 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => dispatch(setEnrollmentFilter(f as any))}
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

      {/* 강의 목록 */}
      {filtered.length === 0 ? (
        <EmptyState
          title="수강 중인 강의가 없어요"
          description="마음에 드는 강의를 찾아 시작해보세요."
          action={<Link to="/courses"><Button>강의 둘러보기</Button></Link>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((e: any, idx: number) => (
            <div
              key={e.id}
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
              {/* 썸네일 */}
              <div
                style={{
                  height: 140,
                  flexShrink: 0, position: 'relative',
                }}
              >
                <CourseThumbnail
                  src={e.thumbnail_url}
                  id={e.course_id ?? idx}
                  title={e.course_title}
                />
                <span
                  style={{
                    position: 'absolute', top: 10, left: 10,
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 'var(--radius-full)',
                    background: e.status === 'completed' ? 'var(--color-success-600)' : 'var(--color-primary-600)',
                    color: '#fff',
                  }}
                >
                  {e.status === 'completed' ? '수료' : '수강 중'}
                </span>
              </div>

              {/* 콘텐츠 */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{
                  margin: 0, fontSize: 15, fontWeight: 600,
                  color: 'var(--color-neutral-800)', lineHeight: 1.4,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  flex: 1,
                }}>
                  {e.course_title}
                </h3>

                {/* 진도 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>진도</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-600)' }}>
                      {e.progress_percent ?? 0}%
                    </span>
                  </div>
                  <ProgressBar value={e.progress_percent ?? 0} max={100} />
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/learn/${e.id}`} style={{ flex: 1 }}>
                    <Button size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                      {e.last_video_id ? '이어보기' : '학습 시작'}
                    </Button>
                  </Link>
                  <Link to={`/courses/${e.course_id}?tab=qa`}>
                    <Button variant="secondary" size="sm" style={{ whiteSpace: 'nowrap' }}>Q&amp;A</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
