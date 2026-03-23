import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/format';

const CARD_HEIGHT = 300;

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#16a34a',
  intermediate: '#d97706',
  advanced: '#dc2626',
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

  /* ── 리스트 뷰 (플립 없음) ── */
  if (viewMode === 'list') {
    return (
      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate(`/courses/${course.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/courses/${course.id}`)}
        style={{
          display: 'flex',
          gap: 20,
          padding: 16,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow)',
          cursor: 'pointer',
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
            {course.instructor_name} · {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
          </p>
          <p style={{ margin: '12px 0 0', fontWeight: 700, color: 'var(--color-text)' }}>
            {formatPrice(course.price)}
          </p>
        </div>
      </div>
    );
  }

  /* ── 그리드 뷰 — 3D 뒤집기 ── */
  return (
    <div
      className="flip-card"
      style={{ height: CARD_HEIGHT }}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="flip-card-inner">

        {/* ── 앞면 ── */}
        <div
          className="flip-card-front"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 썸네일 */}
          <div
            style={{
              height: 160,
              background: 'linear-gradient(135deg, #e8f9ed, #c7f0d2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 999,
                  zIndex: 2,
                }}
              >
                이미 구매함
              </span>
            )}
            {/* 호버 힌트 */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 12,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                fontSize: 11,
                padding: '3px 9px',
                borderRadius: 20,
                pointerEvents: 'none',
              }}
            >
              마우스를 올려보세요 ↩
            </div>
          </div>

          {/* 텍스트 */}
          <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {course.category && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-brand-dark)',
                    background: 'var(--color-brand-soft)',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  {course.category}
                </span>
              )}
              <h3
                style={{
                  margin: '10px 0 6px',
                  fontSize: 15,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {course.title}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>
                {course.instructor_name}
              </p>
            </div>
            <p style={{ margin: '10px 0 0', fontWeight: 800, fontSize: 15 }}>
              {course.price === 0 ? '무료' : formatPrice(course.price)}
            </p>
          </div>
        </div>

        {/* ── 뒷면 ── */}
        <div
          className="flip-card-back"
          style={{
            background: 'linear-gradient(145deg, #0f1f2e 0%, #112318 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px 20px 18px',
          }}
        >
          {/* 상단: 카테고리 + 제목 */}
          <div>
            {course.category && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-brand)',
                  background: 'rgba(0,199,60,0.15)',
                  padding: '3px 10px',
                  borderRadius: 20,
                  marginBottom: 10,
                  letterSpacing: 0.3,
                }}
              >
                {course.category}
              </span>
            )}
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#f3f4f6',
                lineHeight: 1.45,
                margin: '0 0 10px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {course.title}
            </h3>
            {course.description && (
              <p
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  lineHeight: 1.65,
                  margin: '0 0 14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {course.description}
              </p>
            )}
          </div>

          {/* 중단: 메타 정보 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {course.instructor_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>👤</span>
                <span style={{ fontSize: 13, color: '#d1d5db' }}>{course.instructor_name}</span>
              </div>
            )}
            {course.difficulty && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>📶</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: DIFFICULTY_COLOR[course.difficulty] ?? '#d1d5db',
                  }}
                >
                  {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
                </span>
              </div>
            )}
            {course.estimated_hours != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>⏱️</span>
                <span style={{ fontSize: 13, color: '#d1d5db' }}>약 {course.estimated_hours}시간</span>
              </div>
            )}
          </div>

          {/* 하단: 가격 + CTA */}
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
              {course.price === 0 ? '무료' : formatPrice(course.price)}
            </span>
            <div
              style={{
                padding: '8px 16px',
                background: 'var(--color-brand)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
              }}
            >
              강의 보러 가기 →
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
