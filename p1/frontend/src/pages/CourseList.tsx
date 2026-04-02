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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>전체 강의</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>필터와 검색으로 원하는 면접 강의를 찾아보세요.</p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <FilterSidebar
          filters={filters as any}
          onFilter={onFilter}
          onReset={() => {
            dispatch(resetFilters());
            dispatch(fetchCourses());
          }}
          onApply={applyFilters}
        />
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span style={{ color: 'var(--color-muted)' }}>
              총 <strong style={{ color: 'var(--color-text)' }}>{total}</strong>개
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant={viewMode === 'grid' ? 'primary' : 'secondary'} size="sm" onClick={() => dispatch(setViewMode('grid'))}>
                카드
              </Button>
              <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => dispatch(setViewMode('list'))}>
                리스트
              </Button>
            </div>
          </div>

          {listStatus === 'loading' && <p style={{ color: 'var(--color-muted)' }}>불러오는 중…</p>}
          {listStatus === 'failed' && <p style={{ color: 'var(--color-error)' }}>목록을 불러오지 못했습니다.</p>}
          {listStatus === 'succeeded' && items.length === 0 && (
            <EmptyState
              title="강의가 없습니다"
              description="검색 조건을 변경해 보세요."
              action={
                <Button variant="secondary" onClick={() => dispatch(resetFilters())}>
                  필터 초기화
                </Button>
              }
            />
          )}
          {listStatus === 'succeeded' && items.length > 0 && visibleItems.length === 0 && (
            <EmptyState
              title="이미 구매한 강의만 남아있어요"
              description="다른 검색 조건을 사용하거나, 아직 구매하지 않은 강의를 찾아보세요."
              action={
                <Button variant="secondary" onClick={() => dispatch(resetFilters())}>
                  필터 초기화
                </Button>
              }
            />
          )}
          {visibleItems.length > 0 && (
            <div
              style={
                viewMode === 'grid'
                  ? {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: 24,
                    }
                  : { display: 'flex', flexDirection: 'column', gap: 16 }
              }
            >
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

