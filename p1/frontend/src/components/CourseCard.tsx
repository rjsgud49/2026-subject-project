import { useState } from 'react';
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
  const [hovered, setHovered] = useState(false);

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
        overflow: 'visible',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        position: 'relative',
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 썸네일 영역 */}
      <div
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, #e8f9ed, #c7f0d2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          position: 'relative',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          overflow: 'hidden',
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
              zIndex: 2,
            }}
          >
            이미 구매함
          </span>
        )}

        {/* 호버 오버레이 — 요약 정보 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(17,24,39,0.88)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '16px 18px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}
        >
          {/* 설명 */}
          {course.description && (
            <p
              style={{
                color: '#e5e7eb',
                fontSize: 13,
                lineHeight: 1.6,
                margin: '0 0 12px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {course.description}
            </p>
          )}
          {/* 메타 정보 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {course.instructor_name && (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>
                강사 · <span style={{ color: '#d1d5db', fontWeight: 600 }}>{course.instructor_name}</span>
              </span>
            )}
            {course.difficulty && (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>
                난이도 · <span style={{ color: '#d1d5db', fontWeight: 600 }}>{course.difficulty}</span>
              </span>
            )}
            {course.estimated_hours != null && (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>
                수강시간 · <span style={{ color: '#d1d5db', fontWeight: 600 }}>약 {course.estimated_hours}시간</span>
              </span>
            )}
          </div>
          {/* CTA */}
          <div
            style={{
              marginTop: 14,
              padding: '8px 0',
              textAlign: 'center',
              background: 'var(--color-brand)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            강의 보러 가기 →
          </div>
        </div>
      </div>

      {/* 카드 하단 텍스트 */}
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

