import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import type { TicketState } from '../hooks/useFeedbackTickets';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatPrice } from '../utils/format';

const PLANS: {
  id: keyof TicketState;
  name: string;
  icon: string;
  price: number;
  unitPrice: number;
  accent: string;
  recommended?: boolean;
  features: string[];
  deliveryDays: string;
}[] = [
  {
    id: 'doc',
    name: '문서 피드백',
    icon: '📄',
    price: 39900,
    unitPrice: 13300,
    accent: '#3b82f6',
    deliveryDays: '3영업일',
    features: ['자기소개서·이력서·포트폴리오 첨삭', '문서 파일 1건 업로드(pdf, docx, hwp)', '전문가 텍스트 코멘트 제공', '3영업일 이내 답변 보장'],
  },
  {
    id: 'video',
    name: '영상 피드백',
    icon: '🎬',
    price: 59900,
    unitPrice: 19967,
    accent: '#00c73c',
    recommended: true,
    deliveryDays: '5영업일',
    features: ['모의 면접 영상 전문가 피드백', '영상(mp4, mov) 1건 + 문서 1건 업로드', '영상·텍스트 상세 피드백 제공', '5영업일 이내 답변 보장'],
  },
  {
    id: 'premium',
    name: '심층 피드백',
    icon: '🏅',
    price: 99900,
    unitPrice: 33300,
    accent: '#7c3aed',
    deliveryDays: '7영업일',
    features: ['영상·문서 업로드 모두 가능', '전문가 상세 피드백 리포트', '30분 1:1 화상 코칭 포함', '7영업일 이내 진행 보장'],
  },
];

type PayStep = 'select' | 'confirm' | 'processing' | 'done';

export default function FeedbackBuy() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.user.user);
  const { tickets, purchaseTickets } = useFeedbackTickets();

  const [selected, setSelected] = useState<keyof TicketState | null>(null);
  const [payStep, setPayStep] = useState<PayStep>('select');
  const [showModal, setShowModal] = useState(false);

  const plan = PLANS.find((p) => p.id === selected);

  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 12 }}>로그인이 필요합니다</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 28 }}>이용권 구매는 로그인 후 이용하실 수 있습니다.</p>
        <Link to="/login"><Button>로그인하러 가기</Button></Link>
      </div>
    );
  }

  const handlePay = () => {
    if (!selected) return;
    setPayStep('processing');
    // 결제 처리 시뮬레이션
    setTimeout(() => {
      purchaseTickets(selected);
      setPayStep('done');
      setShowModal(true);
    }, 1800);
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px' }}>
      {/* 브레드크럼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-muted)', marginBottom: 32 }}>
        <Link to="/feedback" style={{ color: 'var(--color-muted)' }}>피드백</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>이용권 구매</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>이용권 구매</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 36 }}>
        한 번 구매로 <strong>3회</strong> 피드백을 이용할 수 있습니다. 원하는 플랜을 선택하세요.
      </p>

      {/* 플랜 선택 */}
      {payStep === 'select' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            {PLANS.map((p) => {
              const isSelected = selected === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  style={{
                    position: 'relative',
                    border: `2px solid ${isSelected ? p.accent : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? `${p.accent}08` : '#fff',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 0 0 4px ${p.accent}22` : 'var(--shadow)',
                    transition: 'all 0.15s',
                    overflow: 'hidden',
                  }}
                >
                  {p.recommended && (
                    <div style={{ background: p.accent, color: '#fff', textAlign: 'center', fontSize: 11, fontWeight: 800, padding: '4px 0' }}>
                      가장 인기
                    </div>
                  )}
                  <div style={{ padding: '22px 20px' }}>
                    {/* 헤더 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <span style={{ fontSize: 28 }}>{p.icon}</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 4px' }}>{p.name}</h3>
                        <span style={{ fontSize: 11, fontWeight: 700, color: p.accent, background: `${p.accent}18`, padding: '2px 8px', borderRadius: 10 }}>
                          3회 이용권
                        </span>
                      </div>
                      <div
                        style={{
                          width: 22, height: 22, borderRadius: '50%',
                          border: `2px solid ${isSelected ? p.accent : 'var(--color-border)'}`,
                          background: isSelected ? p.accent : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                      </div>
                    </div>

                    {/* 기능 */}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {p.features.map((f) => (
                        <li key={f} style={{ display: 'flex', gap: 7, fontSize: 13 }}>
                          <span style={{ color: p.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>

                    {/* 가격 */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>3회 패키지</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: p.accent }}>{formatPrice(p.price)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>회당</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-muted)' }}>
                            ≈ {formatPrice(p.unitPrice)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 현재 보유 */}
                    {tickets[p.id] > 0 && (
                      <div style={{ marginTop: 10, fontSize: 12, color: p.accent, fontWeight: 600 }}>
                        현재 {tickets[p.id]}회 보유 중
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button
              onClick={() => selected && setPayStep('confirm')}
              style={{ padding: '14px 52px', fontSize: 16, opacity: selected ? 1 : 0.4 }}
            >
              {selected ? `${plan?.name} 선택 완료 → 결제하기` : '플랜을 선택하세요'}
            </Button>
          </div>
        </>
      )}

      {/* 결제 확인 */}
      {payStep === 'confirm' && plan && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: plan.accent, color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{plan.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{plan.name} 3회 이용권</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{plan.deliveryDays} 이내 답변 보장</div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              {[
                { label: '상품', value: `${plan.name} 3회 이용권` },
                { label: '회당 단가', value: `≈ ${formatPrice(plan.unitPrice)}` },
                { label: '유효 기간', value: '구매일로부터 90일' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: 'var(--color-muted)' }}>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
                <span>결제 금액</span>
                <span style={{ color: plan.accent }}>{formatPrice(plan.price)}</span>
              </div>
            </div>
          </div>

          {/* 결제 수단 선택 (UI mock) */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>결제 수단</div>
            {[
              { id: 'card', label: '신용/체크카드', icon: '💳' },
              { id: 'kakao', label: '카카오페이', icon: '🟡' },
              { id: 'toss', label: '토스페이', icon: '🔵' },
            ].map((m, i) => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', cursor: 'pointer', borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}>
                <input type="radio" name="payMethod" defaultChecked={i === 0} style={{ accentColor: plan.accent }} />
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span style={{ fontSize: 14 }}>{m.label}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setPayStep('select')} style={{ flex: 1, justifyContent: 'center' }}>
              이전
            </Button>
            <Button onClick={handlePay} style={{ flex: 2, justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>
              {formatPrice(plan.price)} 결제하기
            </Button>
          </div>
        </div>
      )}

      {/* 결제 처리 중 */}
      {payStep === 'processing' && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 20, animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ fontSize: 16, color: 'var(--color-muted)' }}>결제를 처리하고 있습니다…</p>
        </div>
      )}

      {/* 완료 모달 */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); navigate('/feedback'); }}
        title="이용권 구매 완료! 🎉"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); navigate('/feedback/new'); }}>
              피드백 바로 신청
            </Button>
            <Button onClick={() => { setShowModal(false); navigate('/feedback'); }}>
              피드백 홈으로
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎟️</div>
          <p style={{ margin: '0 0 16px', lineHeight: 1.75 }}>
            <strong>{plan?.name} 3회 이용권</strong>이 충전되었습니다.
            <br />지금 바로 피드백을 신청하거나 나중에 사용하세요.
          </p>
          <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid var(--color-brand)', borderRadius: 10, fontSize: 14 }}>
            <div style={{ color: 'var(--color-brand)', fontWeight: 800, fontSize: 18 }}>
              {plan?.name} · 3회
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
              구매일로부터 90일간 사용 가능
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
