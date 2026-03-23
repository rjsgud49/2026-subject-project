import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';

const CATEGORIES = [
  { label: '기술면접', emoji: '💻' },
  { label: '인성면접', emoji: '🤝' },
  { label: 'PT면접', emoji: '📊' },
  { label: '영어면접', emoji: '🌐' },
  { label: 'IT직무', emoji: '🖥️' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: '맞춤형 커리큘럼',
    desc: '직무·레벨별로 설계된 강의로 꼭 필요한 내용만 효율적으로 학습하세요.',
  },
  {
    icon: '📱',
    title: '언제 어디서나 학습',
    desc: 'PC·모바일 어디서든 끊김 없이 수강하고 진도를 이어갈 수 있습니다.',
  },
  {
    icon: '🏆',
    title: '현직자 강사진',
    desc: '실제 면접 경험이 풍부한 현직 엔지니어·HR 전문가들이 직접 강의합니다.',
  },
  {
    icon: '💬',
    title: 'Q&A 질문 답변',
    desc: '강의 내 Q&A로 궁금한 점을 즉시 해결하고 학습 효율을 높이세요.',
  },
];

const REVIEWS = [
  {
    name: '김○○',
    role: 'SW 개발자 취업 준비생',
    rating: 5,
    text: '기술 면접 강의 덕분에 자료구조·알고리즘 질문에 자신감이 생겼어요. 실전 예시가 풍부해서 바로 응용할 수 있었습니다.',
    avatar: '👨‍💻',
  },
  {
    name: '이○○',
    role: '취업 준비 6개월 차',
    rating: 5,
    text: '인성 면접 파트가 특히 도움이 됐어요. 자기소개서 연계 답변 전략이 실제 면접에서 그대로 써먹었습니다!',
    avatar: '👩‍🎓',
  },
  {
    name: '박○○',
    role: 'IT 스타트업 합격자',
    rating: 4,
    text: 'PT 면접 구성 방법을 체계적으로 배울 수 있었고, 강사님 피드백이 매우 구체적이었습니다. 추천합니다.',
    avatar: '👨‍💼',
  },
];

const STATS = [
  { value: '1,200+', label: '누적 수강생' },
  { value: '50+', label: '전문 강의' },
  { value: '4.8', label: '평균 수강 평점' },
  { value: '92%', label: '목표 달성률' },
];

export default function Landing() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);

  useEffect(() => {
    api.courses
      .list({ page: '1', size: '4', sort: 'popular' })
      .then((res: any) => setFeaturedCourses(res?.items?.slice(0, 4) || []))
      .catch(() =>
        api.courses
          .list({ page: '1', size: '4' })
          .then((res: any) => setFeaturedCourses(res?.items?.slice(0, 4) || []))
          .catch(() => {})
      );
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section
        style={{
          padding: '72px 24px 88px',
          textAlign: 'center',
          background: 'linear-gradient(160deg, #e8f9ed 0%, #f0f4ff 60%, var(--color-bg) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(99,202,133,0.10)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(99,133,202,0.08)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--color-brand)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: 20,
              marginBottom: 20,
              letterSpacing: 0.5,
            }}
          >
            면접 합격의 첫걸음
          </span>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', fontWeight: 800, marginBottom: 20, lineHeight: 1.3 }}>
            취업 면접,
            <br />
            <span style={{ color: 'var(--color-brand)' }}>체계적으로</span> 준비하세요
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-muted)', marginBottom: 40, lineHeight: 1.7 }}>
            기술·인성·PT 면접 강의를 검색하고,
            <br />
            수강신청 후 내 강의실에서 바로 학습하세요.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn-cta-primary">
              강의 둘러보기
            </Link>
            <Link to="/login" className="btn-cta-secondary">
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 통계 배너 ── */}
      <section
        style={{
          background: 'var(--color-brand)',
          padding: '28px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            textAlign: 'center',
          }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 카테고리 ── */}
      <section style={{ padding: '56px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>카테고리별 강의</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 24, fontSize: 15 }}>
          원하는 면접 유형을 선택해 바로 강의를 찾아보세요.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {CATEGORIES.map(({ label, emoji }) => (
            <Link
              key={label}
              to={`/courses?category=${encodeURIComponent(label)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: 'var(--color-surface)',
                borderRadius: 24,
                border: '1px solid var(--color-border)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-brand)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 18 }}>{emoji}</span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 추천 강의 ── */}
      {featuredCourses.length > 0 && (
        <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>추천 강의</h2>
              <p style={{ color: 'var(--color-muted)', fontSize: 15, margin: 0 }}>지금 가장 인기 있는 강의를 만나보세요.</p>
            </div>
            <Link
              to="/courses"
              style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
            >
              전체 강의 보기 →
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {featuredCourses.map((course: any) => (
              <FeaturedCourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* ── 플랫폼 특징 ── */}
      <section
        style={{
          padding: '64px 24px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>왜 여기서 배울까요?</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 15 }}>
              합격을 앞당기는 4가지 이유
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 수강 후기 ── */}
      <section style={{ padding: '64px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>수강생 후기</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 15 }}>
            실제 수강생들이 직접 남긴 후기입니다.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              style={{
                background: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* 별점 */}
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < r.rating ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>
                    ★
                  </span>
                ))}
              </div>
              {/* 후기 내용 */}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: 'var(--color-text)',
                  margin: 0,
                  flex: 1,
                }}
              >
                "{r.text}"
              </p>
              {/* 작성자 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {r.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 하단 CTA 배너 ── */}
      <section
        style={{
          padding: '64px 24px',
          background: 'linear-gradient(135deg, #1a2b1e 0%, #1e3a5f 100%)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            지금 바로 시작하세요
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>
            첫 강의는 무료로 체험할 수 있습니다.
            <br />
            오늘 시작해서 면접 합격에 한 걸음 더 가까워지세요.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/signup"
              style={{
                padding: '14px 32px',
                background: 'var(--color-brand)',
                color: '#fff',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
              }}
            >
              무료 회원가입
            </Link>
            <Link
              to="/courses"
              style={{
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              강의 먼저 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FeaturedCourseCard({ course }: { course: any }) {
  const navigate = useNavigate();

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

  return (
    <div
      className="flip-card"
      style={{ height: 300 }}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="flip-card-inner">

        {/* 앞면 */}
        <div
          className="flip-card-front"
          style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 155,
              background: 'linear-gradient(135deg, #e8f9ed, #dbeafe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '🎓'
            )}
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
          <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {course.category && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-brand)',
                    background: 'var(--color-brand-soft)',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  {course.category}
                </span>
              )}
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  margin: '8px 0 4px',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {course.title}
              </h3>
              {course.instructor_name && (
                <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
                  {course.instructor_name}
                </p>
              )}
            </div>
            <p style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 15 }}>
              {course.price === 0 ? '무료' : formatPrice(course.price)}
            </p>
          </div>
        </div>

        {/* 뒷면 */}
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
                <span style={{ fontSize: 13, fontWeight: 600, color: DIFFICULTY_COLOR[course.difficulty] ?? '#d1d5db' }}>
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
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
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
