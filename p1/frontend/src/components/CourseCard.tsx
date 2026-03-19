import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function CourseCard({
  course,
  viewMode = 'grid',
  isEnrolled = false,
}: {
  course: any;
  viewMode?: 'grid' | 'list';
  isEnrolled?: boolean;
}) {
  if (viewMode === 'list') {
    return (
      <Link
        to={`/courses/${course.id}`}
        style={{
          display: 'flex',
          gap: 20,
          padding: 16,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow)',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: 160,
            minWidth: 160,
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, #e8f9ed, #c7f0d2)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            '📚'
          )}
          {isEnrolled && (
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: 10,
                background: 'rgba(0,199,60,0.92)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                padding: '6px 10px',
                borderRadius: 999,
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              }}
            >
              이미 구매함
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--color-accent)', marginBottom: 4 }}>{course.category}</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{course.title}</h3>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 14 }}>
            {course.instructor_name} · {course.difficulty}
          </p>
          <p style={{ margin: '12px 0 0', fontWeight: 700, color: 'var(--color-text)' }}>{formatPrice(course.price)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/courses/${course.id}`}
      style={{
        display: 'block',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      <div
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, #e8f9ed, #c7f0d2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          position: 'relative',
        }}
      >
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          '📚'
        )}
        {isEnrolled && (
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              background: 'rgba(0,199,60,0.92)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              padding: '6px 10px',
              borderRadius: 999,
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            }}
          >
            이미 구매함
          </span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-brand-dark)',
            background: 'var(--color-brand-soft)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          {course.category}
        </span>
        <h3 style={{ margin: '12px 0 8px', fontSize: 16, lineHeight: 1.4 }}>{course.title}</h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)' }}>{course.instructor_name}</p>
        <p style={{ margin: '12px 0 0', fontWeight: 800, fontSize: 16 }}>{formatPrice(course.price)}</p>
      </div>
    </Link>
  );
}

