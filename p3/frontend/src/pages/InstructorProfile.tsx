import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';
import CourseThumbnail from '../components/CourseThumbnail';
import Pagination from '../components/Pagination';
import { User, BookOpen, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문', intermediate: '중급', advanced: '고급',
};

type InstructorMeta = {
  name: string;
  bio: string | null;
  profile_html?: string | null;
  banner_url?: string | null;
  categories?: string[];
  total_courses?: number;
};

export default function InstructorProfile() {
  const { name } = useParams<{ name: string }>();
  const decodedName = name ? decodeURIComponent(name) : '';

  const [courses, setCourses] = useState<any[]>([]);
  const [meta, setMeta] = useState<InstructorMeta | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    setCategory('');
  }, [decodedName]);

  useEffect(() => {
    if (!decodedName) return;
    setLoading(true);
    (api as any).courses
      .list({
        instructor_name: decodedName,
        size: PAGE_SIZE,
        page,
        ...(category ? { category } : {}),
      })
      .then((res: any) => {
        const items = res?.items ?? [];
        setCourses(items);
        setTotal(Number(res?.total) || 0);
        if (res?.instructor_meta) {
          setMeta(res.instructor_meta);
        } else if (items[0]?.instructor_name) {
          const f = items[0];
          setMeta({
            name: f.instructor_name,
            bio: f.instructor_bio ?? null,
            profile_html: f.instructor_profile_html ?? null,
            banner_url: f.instructor_banner_url ?? null,
            categories: res?.categories,
            total_courses: Number(res?.total) || 0,
          });
        } else {
          setMeta(null);
        }
      })
      .catch(() => {
        setCourses([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [decodedName, page, category]);

  const displayName = meta?.name ?? decodedName;
  const bio = meta?.bio;
  const profileHtml = meta?.profile_html;
  const bannerUrl = meta?.banner_url;
  const initial = displayName ? displayName[0] : '?';
  const categories = meta?.categories ?? [];
  const totalAll = meta?.total_courses ?? total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const selectCategory = (next: string) => {
    setCategory(next);
    setPage(1);
  };

  const chipStyle = (active: boolean) => ({
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    border: active ? '1px solid var(--color-primary-500)' : '1px solid var(--color-neutral-200)',
    background: active ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
    color: active ? 'var(--color-primary-800)' : 'var(--color-neutral-700)',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 150ms, border-color 150ms, color 150ms',
  } as const);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* 브레드크럼 */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 32 }}>
        <Link to="/courses" style={{ color: 'var(--color-neutral-600)' }}>강의</Link>
        <ChevronRight size={12} />
        <span aria-current="page" style={{ color: 'var(--color-neutral-900)', fontWeight: 500 }}>강사 프로필</span>
      </nav>

      {bannerUrl ? (
        <div
          role="img"
          aria-label="강사 프로필 배너"
          style={{
            height: 200,
            marginBottom: 24,
            borderRadius: 'var(--radius-xl)',
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid var(--color-neutral-200)',
          }}
        />
      ) : null}

      {/* 프로필 카드 */}
      <div
        style={{
          display: 'flex', gap: 24, flexWrap: 'wrap',
          padding: '28px 32px',
          background: 'var(--color-neutral-0)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 32,
        }}
      >
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

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <User size={16} color="var(--color-neutral-400)" />
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>
              {displayName}
            </h1>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--color-primary-700)',
              background: 'var(--color-primary-50)',
              padding: '2px 8px', borderRadius: 'var(--radius-full)',
            }}>
              인증 강사
            </span>
          </div>

          {profileHtml ? (
            <div
              className="instructor-rich"
              style={{ margin: '0 0 16px' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profileHtml) }}
            />
          ) : bio ? (
            <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', margin: '0 0 16px', lineHeight: 1.65 }}>
              {bio}
            </p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: '0 0 16px' }}>
              현직 전문가 강사 · 면접인강 인증 강사
            </p>
          )}

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={15} color="var(--color-primary-500)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                {loading && !meta ? '—' : `${totalAll}개 강의`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: 'var(--color-neutral-900)' }}>
          {displayName} 강사의 강의
        </h2>

        {meta && (categories.length > 0 || totalAll > 0) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: '1px solid var(--color-neutral-200)',
            }}
          >
            <button type="button" onClick={() => selectCategory('')} style={chipStyle(!category)}>
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                style={chipStyle(category === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {!loading && (
          <div style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 16 }}>
            {category ? (
              <span>
                <strong style={{ color: 'var(--color-neutral-800)' }}>{category}</strong> · 총{' '}
                <strong style={{ color: 'var(--color-neutral-800)' }}>{total}</strong>개
              </span>
            ) : (
              <span>
                총 <strong style={{ color: 'var(--color-neutral-800)' }}>{total}</strong>개
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
                <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 16, width: '85%', marginBottom: 6, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 14, width: '35%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 0',
            background: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-neutral-300)',
          }}>
            <User size={48} color="var(--color-neutral-300)" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-neutral-700)' }}>
              강의를 찾을 수 없습니다.
            </p>
            <p style={{ fontSize: 14, margin: 0, color: 'var(--color-neutral-500)' }}>
              다른 카테고리를 선택하거나 전체 강의를 확인해보세요.
            </p>
          </div>
        ) : (
          <>
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
                    <p style={{
                      margin: '0 0 6px', fontSize: 14, fontWeight: 600,
                      color: 'var(--color-neutral-800)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
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
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
