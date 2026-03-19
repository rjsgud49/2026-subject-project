import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchEnrollments, setEnrollmentFilter, setEnrollmentSort } from '../features/enrollmentSlice';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { list, filter, sort } = useAppSelector((s) => s.enrollment);

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
                <Link to={`/learn/${e.id}`}>
                  <Button size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                    {e.last_video_id ? '이어보기' : '학습하기'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

