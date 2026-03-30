import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchEnrollments, setEnrollmentFilter, setEnrollmentSort } from '../features/enrollmentSlice';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const PLAN_META = [
  { id: 'doc' as const,     name: '문서 피드백',   icon: '📄', accent: '#3b82f6' },
  { id: 'video' as const,   name: '영상 피드백',   icon: '🎬', accent: '#00c73c' },
  { id: 'premium' as const, name: '심층 피드백',   icon: '🏅', accent: '#7c3aed' },
];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { list, filter, sort } = useAppSelector((s) => s.enrollment);
  const { tickets } = useFeedbackTickets();
  const totalTickets = tickets.doc + tickets.video + tickets.premium;

  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let rows = [...(list || [])];
    if (filter === 'active') rows = rows.filter((e: any) => e.status !== 'completed');
    if (filter === 'completed') rows = rows.filter((e: any) => e.status === 'completed');
    if (sort === 'title') rows.sort((a: any, b: any) => (a.course_title || '').localeCompare(b.course_title || ''));
    return rows;
  }, [list, filter, sort]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>내 강의실</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>수강 중인 강의와 진도를 확인하세요.</p>

      {/* 피드백 이용권 현황 */}
      <div
        style={{
          padding: '20px 24px',
          background: totalTickets > 0 ? '#f0fdf4' : 'var(--color-surface)',
          border: `1px solid ${totalTickets > 0 ? 'var(--color-brand)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          marginBottom: 32,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🎟️</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>피드백 이용권</span>
            {totalTickets > 0 && (
              <span
                style={{
                  background: 'var(--color-brand)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: 20,
                }}
              >
                총 {totalTickets}회 보유
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {PLAN_META.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <span>{p.icon}</span>
                <span style={{ color: 'var(--color-muted)' }}>{p.name}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 24,
                    height: 24,
                    borderRadius: 12,
                    background: tickets[p.id] > 0 ? p.accent : '#e5e7eb',
                    color: tickets[p.id] > 0 ? '#fff' : '#9ca3af',
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '0 7px',
                  }}
                >
                  {tickets[p.id]}회
                </span>
              </div>
            ))}
          </div>
          {totalTickets === 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>
              보유한 피드백 이용권이 없습니다.
            </p>
          )}
        </div>
        <Link to="/feedback">
          <Button variant={totalTickets > 0 ? 'primary' : 'secondary'} size="sm">
            {totalTickets > 0 ? '이용권 사용하기' : '이용권 구매하기'}
          </Button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => dispatch(setEnrollmentFilter(f as any))}
          >
            {f === 'all' ? '전체' : f === 'active' ? '수강 중' : '수료'}
          </Button>
        ))}
        <select
          value={sort}
          onChange={(e) => dispatch(setEnrollmentSort(e.target.value))}
          className="ui-select"
          style={{ width: 160, marginLeft: 'auto' }}
        >
          <option value="recent">최근 수강순</option>
          <option value="title">제목순</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="수강 중인 강의가 없습니다"
          action={
            <Link to="/courses">
              <Button>강의 둘러보기</Button>
            </Link>
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {filtered.map((e: any) => (
            <div
              key={e.id}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  height: 140,
                  background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                }}
              >
                {e.thumbnail_url ? (
                  <img src={e.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '📚'
                )}
              </div>
              <div style={{ padding: 16 }}>
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: e.status === 'completed' ? '#d1fae5' : '#dbeafe',
                    color: e.status === 'completed' ? '#065f46' : '#1e40af',
                  }}
                >
                  {e.status === 'completed' ? '수료' : '수강 중'}
                </span>
                <h3 style={{ margin: '12px 0 8px', fontSize: 16 }}>{e.course_title}</h3>
                <ProgressBar value={e.progress_percent ?? 0} max={100} />
                <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '8px 0 16px' }}>
                  진도 {e.progress_percent ?? 0}%
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/learn/${e.id}`} style={{ flex: 1 }}>
                    <Button size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                      {e.last_video_id ? '이어보기' : '학습하기'}
                    </Button>
                  </Link>
                  <Link to={`/courses/${e.course_id}?tab=qa`}>
                    <Button variant="secondary" size="sm" style={{ whiteSpace: 'nowrap' }}>
                      Q&amp;A
                    </Button>
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

