import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import { useFeedbackSubmissions } from '../hooks/useFeedbackSubmissions';
import { formatPrice } from '../utils/format';

const PLANS = [
  { id: 'doc' as const,     name: '문서 피드백',   icon: '📄', price: 39900,  accent: '#3b82f6', desc: '자기소개서·이력서·포트폴리오 첨삭' },
  { id: 'video' as const,   name: '영상 피드백',   icon: '🎬', price: 59900,  accent: '#00c73c', desc: '모의 면접 영상 전문가 피드백' },
  { id: 'premium' as const, name: '심층 피드백',   icon: '🏅', price: 99900,  accent: '#7c3aed', desc: '영상+문서+1:1 화상 코칭' },
];

const STATUS_MAP = {
  pending:     { label: '접수 완료', color: '#d97706', bg: '#fef3c7' },
  in_progress: { label: '검토 중',   color: '#1d4ed8', bg: '#dbeafe' },
  completed:   { label: '완료',      color: '#065f46', bg: '#d1fae5' },
};

export default function FeedbackMain() {
  const user = useAppSelector((s) => s.user.user);
  const { tickets } = useFeedbackTickets();
  const { submissions } = useFeedbackSubmissions();
  const totalTickets = tickets.doc + tickets.video + tickets.premium;
  const recentSubs = submissions.slice(0, 3);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

      {/* ── Hero ── */}
      <div
        style={{
          textAlign: 'center',
          padding: '56px 24px',
          background: 'linear-gradient(160deg, #e8f9ed 0%, #eff6ff 100%)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(99,202,133,0.12)', pointerEvents: 'none' }} />
        <span style={{ display: 'inline-block', background: 'var(--color-brand)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, marginBottom: 16 }}>
          전문가 1:1 피드백
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 12 }}>
          합격을 앞당기는 피드백 서비스
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 16, lineHeight: 1.75, marginBottom: 36 }}>
          이용권을 구매하고, 원할 때마다 영상·서류 피드백을 신청하세요.
          <br />현직 전문가가 직접 검토하고 구체적인 피드백을 제공합니다.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/feedback/buy"
            style={{ padding: '13px 32px', background: 'var(--color-brand)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
          >
            🎟️ 이용권 구매하기
          </Link>
          <Link
            to={totalTickets > 0 ? '/feedback/new' : '/feedback/buy'}
            style={{
              padding: '13px 32px',
              background: totalTickets > 0 ? '#fff' : '#f3f4f6',
              color: totalTickets > 0 ? 'var(--color-brand)' : 'var(--color-muted)',
              border: `2px solid ${totalTickets > 0 ? 'var(--color-brand)' : 'var(--color-border)'}`,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            📤 피드백 신청하기
            {totalTickets > 0 && <span style={{ marginLeft: 8, background: 'var(--color-brand)', color: '#fff', borderRadius: 12, padding: '1px 8px', fontSize: 12 }}>{totalTickets}회</span>}
          </Link>
        </div>
      </div>

      {/* ── 이용권 현황 (로그인 시) ── */}
      {user && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🎟️ 내 이용권 현황</h2>
            <Link to="/feedback/history" style={{ fontSize: 14, color: 'var(--color-brand)', fontWeight: 600 }}>
              신청 내역 보기 →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {PLANS.map((p) => {
              const count = tickets[p.id];
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '16px 18px',
                    border: `1.5px solid ${count > 0 ? p.accent : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: count > 0 ? `${p.accent}08` : '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: count > 0 ? p.accent : '#d1d5db' }}>
                      {count}<span style={{ fontSize: 13, fontWeight: 500, marginLeft: 3 }}>회</span>
                    </div>
                  </div>
                  {count > 0 && (
                    <Link
                      to="/feedback/new"
                      style={{ fontSize: 12, color: '#fff', background: p.accent, padding: '5px 10px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      신청
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 플랜 소개 ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 이용권 플랜</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {PLANS.map((p) => (
            <div key={p.id} style={{ padding: '22px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: '#fff', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>{p.desc}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: p.accent }}>{formatPrice(p.price)}</span>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>/ 3회 이용권</span>
              </div>
              <Link
                to="/feedback/buy"
                style={{ display: 'block', textAlign: 'center', padding: '9px 0', background: p.accent, color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
              >
                구매하기
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── 최근 신청 내역 (로그인 시) ── */}
      {user && recentSubs.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📂 최근 신청 내역</h2>
            <Link to="/feedback/history" style={{ fontSize: 14, color: 'var(--color-brand)', fontWeight: 600 }}>
              전체 보기 →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentSubs.map((s) => {
              const st = STATUS_MAP[s.status];
              return (
                <Link
                  key={s.id}
                  to="/feedback/history"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textDecoration: 'none', color: 'inherit' }}
                >
                  <span style={{ fontSize: 24 }}>{s.planIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.planName} · {s.feedbackType}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{s.jobCategory} · {new Date(s.submittedAt).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {st.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
