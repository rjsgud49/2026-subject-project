import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import type { TicketState } from '../hooks/useFeedbackTickets';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatPrice } from '../utils/format';
import {
  FileText, Video, Award, Ticket, Lock, CreditCard,
  Check, ChevronRight, Receipt,
} from 'lucide-react';

const PLAN_ICONS: Record<string, React.ElementType> = {
  doc: FileText, video: Video, premium: Award,
};

const PLANS: {
  id: keyof TicketState;
  name: string;
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
    price: 39900,
    unitPrice: 13300,
    accent: '#2563EB',
    deliveryDays: '3영업일',
    features: ['자기소개서·이력서·포트폴리오 첨삭', '문서 파일 1건 업로드(pdf, docx, hwp)', '전문가 텍스트 코멘트 제공', '3영업일 이내 답변 보장'],
  },
  {
    id: 'video',
    name: '영상 피드백',
    price: 59900,
    unitPrice: 19967,
    accent: '#16a34a',
    recommended: true,
    deliveryDays: '5영업일',
    features: ['모의 면접 영상 전문가 피드백', '영상(mp4, mov) 1건 + 문서 1건 업로드', '영상·텍스트 상세 피드백 제공', '5영업일 이내 답변 보장'],
  },
  {
    id: 'premium',
    name: '심층 피드백',
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
  const { tickets, purchaseTickets, purchaseHistory } = useFeedbackTickets(!!user);

  const [selected, setSelected] = useState<keyof TicketState | null>(null);
  const [payStep, setPayStep] = useState<PayStep>('select');
  const [showModal, setShowModal] = useState(false);

  const plan = PLANS.find((p) => p.id === selected);

  if (!user) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={28} color="var(--color-neutral-400)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--color-neutral-900)' }}>로그인이 필요합니다</h2>
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 28, fontSize: 14 }}>이용권 구매는 로그인 후 이용하실 수 있습니다.</p>
        <Link to="/login"><Button size="lg">로그인하러 가기</Button></Link>
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
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${p.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                          {(() => { const Icon = PLAN_ICONS[p.id]; return <Icon size={22} color={p.accent} />; })()}
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--color-neutral-900)' }}>{p.name}</h3>
                        <span style={{ fontSize: 11, fontWeight: 700, color: p.accent, background: `${p.accent}15`, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          3회 이용권
                        </span>
                      </div>
                      <div
                        style={{
                          width: 22, height: 22, borderRadius: '50%',
                          border: `2px solid ${isSelected ? p.accent : 'var(--color-neutral-300)'}`,
                          background: isSelected ? p.accent : 'var(--color-neutral-0)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 150ms',
                        }}
                      >
                        {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>

                    {/* 기능 */}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {p.features.map((f) => (
                        <li key={f} style={{ display: 'flex', gap: 7, fontSize: 13, color: 'var(--color-neutral-600)' }}>
                          <Check size={14} color={p.accent} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }} />
                          {f}
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
              {(() => { const Icon = PLAN_ICONS[plan.id]; return <Icon size={22} />; })()}
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
              { id: 'card', label: '신용/체크카드' },
              { id: 'kakao', label: '카카오페이' },
              { id: 'toss', label: '토스페이' },
            ].map((m, i) => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', cursor: 'pointer', borderTop: i > 0 ? '1px solid var(--color-neutral-200)' : undefined }}>
                <input type="radio" name="payMethod" defaultChecked={i === 0} style={{ accentColor: plan.accent }} />
                <CreditCard size={16} color="var(--color-neutral-400)" />
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
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--color-primary-200)', borderTopColor: 'var(--color-primary-500)', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontSize: 16, color: 'var(--color-neutral-500)' }}>결제를 처리하고 있습니다…</p>
        </div>
      )}

      {/* 결제 기록 */}
      <div style={{ marginTop: 60, borderTop: '1px solid var(--color-neutral-200)', paddingTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Receipt size={18} color="var(--color-neutral-600)" />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-neutral-900)' }}>결제 기록</h2>
        </div>

        {purchaseHistory.length === 0 ? (
          <div style={{
            padding: '40px 0', textAlign: 'center',
            background: 'var(--color-neutral-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-neutral-300)',
          }}>
            <Receipt size={36} color="var(--color-neutral-300)" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)' }}>아직 결제 기록이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {purchaseHistory.map((r) => {
              const IconComp = PLAN_ICONS[r.planId] ?? Ticket;
              const plan_ = PLANS.find((p) => p.id === r.planId);
              const accent = plan_?.accent ?? 'var(--color-primary-500)';
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px',
                  background: 'var(--color-neutral-0)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComp size={18} color={accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--color-neutral-800)' }}>
                      {r.planName} <span style={{ fontWeight: 400, color: 'var(--color-neutral-500)' }}>· {r.count}회 이용권</span>
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-neutral-400)' }}>
                      {new Date(r.purchasedAt).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: accent, flexShrink: 0 }}>
                    {formatPrice(r.price)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 완료 모달 */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); navigate('/feedback'); }}
        title="이용권 구매 완료"
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
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Ticket size={30} color="var(--color-success-600)" />
          </div>
          <p style={{ margin: '0 0 16px', lineHeight: 1.75, fontSize: 15 }}>
            <strong>{plan?.name} 3회 이용권</strong>이 충전되었습니다.
            <br />지금 바로 피드백을 신청하거나 나중에 사용하세요.
          </p>
          <div style={{ padding: '14px 18px', background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)', borderRadius: 'var(--radius-lg)', fontSize: 14 }}>
            <div style={{ color: 'var(--color-success-700)', fontWeight: 800, fontSize: 17 }}>
              {plan?.name} · 3회
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-success-600)', marginTop: 4 }}>
              구매일로부터 90일간 사용 가능
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
