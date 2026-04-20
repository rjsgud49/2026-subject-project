import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import CourseThumbnail from './CourseThumbnail';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};
const DIFFICULTY_COLOR: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: 'var(--color-success-50)',  text: 'var(--color-success-700)' },
  intermediate: { bg: 'var(--color-warning-50)',  text: 'var(--color-warning-700)' },
  advanced:     { bg: 'var(--color-error-50)',    text: 'var(--color-error-700)' },
};

export default function CourseCard({
  course,
  viewMode = 'grid',
  isEnrolled = false,
}: {
  course: any;
  viewMode?: 'grid' | 'list';
  isEnrolled?: boolean;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const diff = DIFFICULTY_COLOR[course.difficulty] ?? { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-600)' };

  const goInstructor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (course.instructor_name) {
      navigate(`/instructors/${encodeURIComponent(course.instructor_name)}`);
    }
  };

  /* ── 리스트 뷰 ── */
  if (viewMode === 'list') {
    return (
      <div
        role="link"
        tabIndex={0}
        aria-label={`${course.title} 강의 상세 보기`}
        onClick={() => navigate(`/courses/${course.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/courses/${course.id}`)}
        style={{
          display: 'flex', gap: 16, padding: 16,
          background: 'var(--color-neutral-0)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'box-shadow 200ms ease, transform 200ms ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 썸네일 */}
        <div
          style={{
            width: 144, minWidth: 144, aspectRatio: '16/9',
            borderRadius: 8, overflow: 'hidden', flexShrink: 0,
            position: 'relative',
          }}
        >
          <CourseThumbnail src={course.thumbnail_url} id={course.id} title={course.title} borderRadius={8} />
          {isEnrolled && (
            <span style={{
              position: 'absolute', left: 6, top: 6,
              background: 'var(--color-success-600)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
            }}>
              수강 중
            </span>
          )}
        </div>
        {/* 텍스트 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            {course.category && (
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                {course.category}
              </span>
            )}
            {course.difficulty && (
              <span style={{ fontSize: 11, fontWeight: 500, color: diff.text, background: diff.bg, padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
              </span>
            )}
          </div>
          <h3 style={{
            margin: '0 0 4px', fontSize: 16, fontWeight: 600,
            color: 'var(--color-neutral-800)', lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {course.title}
          </h3>
          {course.instructor_name && (
            <button
              type="button"
              onClick={goInstructor}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: 13, color: 'var(--color-neutral-500)',
                cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: 10, textAlign: 'left',
                textDecoration: 'underline',
                textDecorationColor: 'transparent',
                transition: 'color 150ms, text-decoration-color 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary-600)';
                e.currentTarget.style.textDecorationColor = 'var(--color-primary-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-neutral-500)';
                e.currentTarget.style.textDecorationColor = 'transparent';
              }}
            >
              {course.instructor_name}
            </button>
          )}
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            {course.price === 0 || course.price === '0'
              ? <span style={{ color: 'var(--color-success-600)' }}>무료</span>
              : formatPrice(course.price)
            }
          </p>
        </div>
      </div>
    );
  }

  /* ── 그리드 뷰 — Elevated Card ── */
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${course.title} 강의 상세 보기`}
      onClick={() => navigate(`/courses/${course.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/courses/${course.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-neutral-0)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: 'pointer', overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
      }}
    >
      {/* 썸네일 */}
      <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <CourseThumbnail src={course.thumbnail_url} id={course.id} title={course.title} />
        {isEnrolled && (
          <span style={{
            position: 'absolute', left: 10, top: 10,
            background: 'var(--color-success-600)', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
          }}>
            수강 중
          </span>
        )}
      </div>

      {/* 콘텐츠 */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* 뱃지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {course.category && (
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
              {course.category}
            </span>
          )}
          {course.difficulty && (
            <span style={{ fontSize: 11, fontWeight: 500, color: diff.text, background: diff.bg, padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
              {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3 style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          color: 'var(--color-neutral-800)', lineHeight: 1.45,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          flex: 1,
        }}>
          {course.title}
        </h3>

        {/* 강사명 클릭 */}
        {course.instructor_name && (
          <button
            type="button"
            onClick={goInstructor}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: 12, color: 'var(--color-neutral-500)',
              cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
              transition: 'color 150ms, text-decoration-color 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary-600)';
              e.currentTarget.style.textDecorationColor = 'var(--color-primary-300)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-neutral-500)';
              e.currentTarget.style.textDecorationColor = 'transparent';
            }}
          >
            {course.instructor_name}
          </button>
        )}

        {/* 가격 */}
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {course.price === 0 || course.price === '0'
            ? <span style={{ color: 'var(--color-success-600)', fontWeight: 700 }}>무료</span>
            : formatPrice(course.price)
          }
        </p>
      </div>
    </div>
  );
}
