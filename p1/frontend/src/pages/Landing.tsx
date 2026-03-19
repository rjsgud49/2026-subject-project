import { Link } from 'react-router-dom';

export default function Landing() {
  const cats = ['기술면접', '인성면접', 'PT면접', '영어면접', 'IT직무'];
  return (
    <>
      <section
        style={{
          padding: '64px 24px 80px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #e8f9ed 0%, var(--color-bg) 100%)',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
            취업 면접,
            <br />
            <span style={{ color: 'var(--color-brand)' }}>체계적으로</span> 준비하세요
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-muted)', marginBottom: 36 }}>
            기술·인성·PT 면접 강의를 검색하고, 수강신청 후 내 강의실에서 바로 학습하세요.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn-cta-primary">
              강의 둘러보기
            </Link>
            <Link to="/login" className="btn-cta-secondary">
              무료로 시작
            </Link>
          </div>
        </div>
      </section>
      <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, marginBottom: 24 }}>카테고리별 강의</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {cats.map((c) => (
            <Link
              key={c}
              to={`/courses?category=${encodeURIComponent(c)}`}
              style={{
                padding: '12px 20px',
                background: 'var(--color-surface)',
                borderRadius: 24,
                border: '1px solid var(--color-border)',
                fontWeight: 600,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

