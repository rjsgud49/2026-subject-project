import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  fetchCourses,
  setFilter,
  setFilters,
  resetFilters,
  setPage,
  setViewMode,
} from '../features/coursesSlice';
import { fetchEnrollments } from '../features/enrollmentSlice';
import FilterSidebar from '../components/FilterSidebar';
import CourseCard from '../components/CourseCard';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export default function CourseList() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { filters, items, total, size, listStatus, viewMode } = useAppSelector((s) => s.courses);
  const user = useAppSelector((s) => s.user.user);
  const enrollments = useAppSelector((s) => s.enrollment.list);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) dispatch(setFilters({ category: cat, page: 1 }));
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (user) dispatch(fetchEnrollments());
  }, [user, dispatch]);

  useEffect(() => {
    dispatch(fetchCourses());
    // jobField가 바뀌면 page를 1로 리셋하여 재조회
  }, [dispatch, filters.page, filters.size, filters.sort, filters.category, filters.jobField, filters.difficulty, filters.freeOnly, filters.min_price, filters.max_price]);

  const applyFilters = () => {
    dispatch(fetchCourses());
  };

  const onFilter = (key: string, value: unknown) => dispatch(setFilter({ key, value }));

  const totalPages = Math.max(1, Math.ceil(total / size));
  const enrolledCourseIds = new Set((enrollments || []).map((e: any) => Number(e.course_id)));

  // 모든 카테고리·직무 필터링은 서버(API)에서 처리하므로 클라이언트에서 추가 필터링 불필요
  // 수강 중인 강의만 목록에서 제외 (로그인 유저 한정)
  const visibleItems = user ? items.filter((c: any) => !enrolledCourseIds.has(Number(c.id))) : items;

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>전체 강의</h1>
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 14 }}>필터와 검색으로 원하는 면접 강의를 찾아보세요.</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <FilterSidebar
          filters={filters as any}
          onFilter={onFilter}
          onReset={() => { dispatch(resetFilters()); dispatch(fetchCourses()); }}
          onApply={applyFilters}
        />
        <div style={{ flex: 1, minWidth: 280 }}>
          {/* 결과 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>
              총 <strong style={{ color: 'var(--color-neutral-800)' }}>{total}</strong>개
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => dispatch(setViewMode(mode))}
                  style={{
                    height: 32, padding: '0 12px',
                    borderRadius: 6, border: 'none',
                    fontSize: 13, cursor: 'pointer',
                    background: viewMode === mode ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                    color: viewMode === mode ? '#fff' : 'var(--color-neutral-600)',
                    fontFamily: 'inherit', fontWeight: viewMode === mode ? 600 : 400,
                    transition: 'background 150ms, color 150ms',
                  }}
                >
                  {mode === 'grid' ? '카드' : '목록'}
                </button>
              ))}
            </div>
          </div>

          {/* 상태 처리 */}
          {listStatus === 'loading' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 6, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '55%', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {listStatus === 'failed' && (
            <div style={{ padding: '20px', background: 'var(--color-error-50)', borderRadius: 8, border: '1px solid var(--color-error-100)', fontSize: 14, color: 'var(--color-error-700)' }}>
              강의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </div>
          )}
          {listStatus === 'succeeded' && items.length === 0 && (
            <EmptyState
              title="검색 결과가 없어요."
              description="다른 키워드나 필터로 시도해보세요."
              action={<Button variant="secondary" onClick={() => dispatch(resetFilters())}>필터 초기화</Button>}
            />
          )}
          {listStatus === 'succeeded' && items.length > 0 && visibleItems.length === 0 && (
            <EmptyState
              title="이미 수강 중인 강의만 남아있어요."
              description="다른 검색 조건을 사용하거나 아직 구매하지 않은 강의를 찾아보세요."
              action={<Button variant="secondary" onClick={() => dispatch(resetFilters())}>필터 초기화</Button>}
            />
          )}
          {visibleItems.length > 0 && (
            <div style={viewMode === 'grid'
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }
              : { display: 'flex', flexDirection: 'column', gap: 12 }
            }>
              {visibleItems.map((c: any) => (
                <CourseCard key={c.id} course={c} viewMode={viewMode} isEnrolled={enrolledCourseIds.has(Number(c.id))} />
              ))}
            </div>
          )}
          <Pagination page={filters.page} totalPages={totalPages} onPageChange={(p: number) => dispatch(setPage(p))} />
        </div>
      </div>
    </div>
  );
}

