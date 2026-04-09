import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';
import CourseThumbnail from '../components/CourseThumbnail';
import { User, BookOpen, Clock, ChevronRight } from 'lucide-react';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문', intermediate: '중급', advanced: '고급',
};

export default function InstructorProfile() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : '';
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedName) return;
    setLoading(true);
    (api as any).courses.list({ q: decodedName, size: 50, page: 1 })
      .then((res: any) => {
        const all: any[] = res?.items ?? [];
        setCourses(all.filter((c: any) => c.instructor_name === decodedName));
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [decodedName]);

  const totalHours = courses.reduce((s, c) => s + (Number(c.estimated_hours) || 0), 0);
  const initial = decodedName ? decodedName[0] : '?';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* 브레드크럼 */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 32 }}>
        <Link to="/courses" style={{ color: 'var(--color-neutral-600)' }}>강의</Link>
        <ChevronRight size={12} />
        <span aria-current="page">강사 프로필</span>
      </nav>

      {/* 프로필 카드 */}
      <div
        style={{
          display: 'flex', gap: 24, flexWrap: 'wrap',
          padding: '28px 32px',
          background: 'var(--color-neutral-0)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 40,
        }}
      >
        {/* 아바타 */}
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: 'var(--color-primary-100)',
            color: 'var(--color-primary-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800,
          }}
        >
          {initial}
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <User size={16} color="var(--color-neutral-400)" />
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>
              {decodedName}
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: '0 0 20px', lineHeight: 1.6 }}>
            현직 전문가 강사 · 면접인강 인증 강사
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={16} color="var(--color-primary-500)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-700)' }}>{courses.length}개 강의</span>
            </div>
            {totalHours > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color="var(--color-neutral-400)" />
                <span style={{ fontSize: 14, color: 'var(--color-neutral-600)' }}>총 {totalHours}시간</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: 'var(--color-neutral-900)' }}>
          {decodedName} 강사의 강의
        </h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
                <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 16, width: '85%', marginBottom: 6, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-500)' }}>
            <User size={48} color="var(--color-neutral-300)" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-neutral-700)' }}>
              강의를 찾을 수 없어요.
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>다른 강사를 검색하거나 전체 강의를 확인해보세요.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                style={{
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--color-neutral-0)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-neutral-200)',
                  overflow: 'hidden', textDecoration: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 200ms, transform 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <CourseThumbnail src={c.thumbnail_url} id={c.id} title={c.title} />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                    {c.category && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                        {c.category}
                      </span>
                    )}
                    {c.difficulty && (
                      <span style={{ fontSize: 11, color: 'var(--color-neutral-500)', background: 'var(--color-neutral-100)', padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                        {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-800)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    {c.price === 0 || c.price === '0'
                      ? <span style={{ color: 'var(--color-success-600)' }}>무료</span>
                      : formatPrice(c.price)
                    }
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
