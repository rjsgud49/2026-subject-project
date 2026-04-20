import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useRedirectIfNotStudentFeedback } from '../hooks/useRedirectIfNotStudentFeedback';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import { useFeedbackSubmissions } from '../hooks/useFeedbackSubmissions';
import { formatPrice } from '../utils/format';
import { FileText, Video, Award, ShoppingBag, PlusCircle, ClipboardList } from 'lucide-react';

const PLAN_ICONS: Record<string, React.ElementType> = {
  doc: FileText, video: Video, premium: Award,
};

const PLANS = [
  { id: 'doc' as const,     name: '문서 피드백',  price: 39900,  color: 'var(--color-primary-600)',  bg: 'var(--color-primary-50)',  desc: '자기소개서·이력서·포트폴리오 첨삭' },
  { id: 'video' as const,   name: '영상 피드백',  price: 59900,  color: 'var(--color-success-600)',  bg: 'var(--color-success-50)',  desc: '모의 면접 영상 전문가 피드백' },
  { id: 'premium' as const, name: '심층 피드백',  price: 99900,  color: '#7c3aed',                   bg: '#f5f3ff',                  desc: '영상+문서+1:1 화상 코칭' },
];

const STATUS_MAP = {
  pending:     { label: '접수 완료', color: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' },
  in_progress: { label: '검토 중',   color: 'var(--color-primary-700)', bg: 'var(--color-primary-50)' },
  completed:   { label: '완료',      color: 'var(--color-success-700)', bg: 'var(--color-success-50)' },
};

export default function FeedbackMain() {
  useRedirectIfNotStudentFeedback();
  const user = useAppSelector((s) => s.user.user);
  const { tickets } = useFeedbackTickets(!!user);
  const { submissions } = useFeedbackSubmissions();
  const totalTickets = tickets.doc + tickets.video + tickets.premium;
  const recentSubs = submissions.slice(0, 3);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

      {/* Hero */}
      <div
        style={{
          textAlign: 'center',
          padding: '56px 24px',
          background: 'var(--color-primary-600)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 'var(--radius-full)', marginBottom: 16 }}>
          전문가 1:1 피드백
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
          합격을 앞당기는 피드백 서비스
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
          이용권을 구매하고, 원할 때마다 영상·서류 피드백을 신청하세요.<br />
          현직 전문가가 직접 검토하고 구체적인 피드백을 제공합니다.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/feedback/buy"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 28px', background: '#fff', color: 'var(--color-primary-600)',
              borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: 'var(--shadow-md)', transition: 'transform 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <ShoppingBag size={16} />
            이용권 구매하기
          </Link>
          <Link
            to={totalTickets > 0 ? '/feedback/new' : '/feedback/buy'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 28px',
              background: totalTickets > 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = totalTickets > 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'; }}
          >
            <PlusCircle size={16} />
            피드백 신청하기
            {totalTickets > 0 && (
              <span style={{ background: 'var(--color-primary-500)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '1px 8px', fontSize: 12, fontWeight: 700 }}>
                {totalTickets}회
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 이용권 현황 (로그인 시) */}
      {user && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>내 이용권 현황</h2>
            <Link to="/feedback/history" style={{ fontSize: 13, color: 'var(--color-primary-600)', fontWeight: 600 }}>신청 내역 보기 →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {PLANS.map((p) => {
              const count = tickets[p.id];
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '16px 18px',
                    border: `1px solid ${count > 0 ? 'var(--color-primary-200)' : 'var(--color-neutral-200)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: count > 0 ? p.bg : 'var(--color-neutral-0)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  {(() => { const Icon = PLAN_ICONS[p.id]; return <div style={{ width: 36, height: 36, borderRadius: 8, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} color={p.color} /></div>; })()}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: count > 0 ? p.color : 'var(--color-neutral-300)' }}>
                      {count}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 3, color: 'var(--color-neutral-400)' }}>회</span>
                    </div>
                  </div>
                  {count > 0 && (
                    <Link
                      to="/feedback/new"
                      style={{ fontSize: 12, color: '#fff', background: p.color, padding: '4px 10px', borderRadius: 6, fontWeight: 600, textDecoration: 'none' }}
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

      {/* 플랜 소개 */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: 'var(--color-neutral-900)' }}>이용권 플랜</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {PLANS.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '24px 20px',
                background: 'var(--color-neutral-0)',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(() => { const Icon = PLAN_ICONS[p.id]; return <Icon size={24} color={p.color} />; })()}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: p.color }}>{formatPrice(p.price)}</span>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>/ 3회 이용권</span>
              </div>
              <Link
                to="/feedback/buy"
                style={{
                  display: 'block', textAlign: 'center', padding: '9px 0',
                  background: p.color, color: '#fff', borderRadius: 8,
                  fontWeight: 600, fontSize: 14, textDecoration: 'none',
                  marginTop: 4,
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                구매하기
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 신청 내역 */}
      {user && recentSubs.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <ClipboardList size={17} color="var(--color-neutral-600)" />
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>최근 신청 내역</h2>
            </div>
            <Link to="/feedback/history" style={{ fontSize: 13, color: 'var(--color-primary-600)', fontWeight: 600 }}>전체 보기 →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSubs.map((s) => {
              const st = STATUS_MAP[s.status] ?? STATUS_MAP.pending;
              const planId = (s as any).planId ?? 'doc';
              const PlanIcon = PLAN_ICONS[planId] ?? FileText;
              const planData = PLANS.find((p) => p.id === planId);
              return (
                <Link
                  key={s.id}
                  to="/feedback/history"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    background: 'var(--color-neutral-0)',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                    textDecoration: 'none', color: 'inherit',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: planData?.bg ?? 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlanIcon size={18} color={planData?.color ?? 'var(--color-neutral-500)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: 'var(--color-neutral-800)' }}>
                      {(s as any).planName} · {(s as any).feedbackType}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                      {(s as any).jobCategory} · {new Date((s as any).submittedAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: st.color, background: st.bg, padding: '3px 10px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
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
