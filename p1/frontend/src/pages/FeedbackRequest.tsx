import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import type { TicketState } from '../hooks/useFeedbackTickets';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatPrice } from '../utils/format';

const TICKETS_PER_PURCHASE = 3;

const PLANS: {
  id: keyof TicketState;
  name: string;
  price: number;
  unitPrice: number;
  desc: string;
  features: string[];
  icon: string;
  accent: string;
  recommended?: boolean;
}[] = [
  {
    id: 'doc',
    name: '문서 피드백',
    price: 39900,
    unitPrice: 13300,
    desc: '자기소개서·이력서·포트폴리오 등 문서를 올리면 전문가가 첨삭합니다',
    features: ['문서 파일 1건 업로드', '전문가 텍스트 피드백', '3영업일 이내 답변'],
    icon: '📄',
    accent: '#3b82f6',
  },
  {
    id: 'video',
    name: '영상 피드백',
    price: 59900,
    unitPrice: 19967,
    desc: '모의 면접 영상을 올리면 현직 전문가가 구체적인 피드백을 제공합니다',
    features: ['영상 파일 1건 업로드', '문서 1건 추가 가능', '전문가 영상·텍스트 피드백', '5영업일 이내 답변'],
    icon: '🎬',
    accent: 'var(--color-brand)',
    recommended: true,
  },
  {
    id: 'premium',
    name: '심층 피드백',
    price: 99900,
    unitPrice: 33300,
    desc: '영상·문서 피드백 + 전문가와 1:1 화상 세션으로 심층 코칭',
    features: ['영상 + 문서 업로드', '전문가 피드백 리포트', '30분 1:1 화상 코칭', '7영업일 이내 진행'],
    icon: '🏅',
    accent: '#7c3aed',
  },
];

const JOB_CATEGORIES = [
  'IT개발', '금융/은행', '마케팅/광고', '영업', '의료/간호',
  '공무원/공기업', '교육/강사', '디자인', '경영/기획', '법률/회계',
];

const FEEDBACK_TYPES = ['자기소개서', '이력서', '포트폴리오', '면접 영상', '기타'];

export default function FeedbackRequest() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.user.user);
  const { tickets, purchaseTickets, useTicket } = useFeedbackTickets();

  const [selectedPlan, setSelectedPlan] = useState<keyof TicketState | null>(null);
  // 'buy' = 이용권 구매, 'use' = 보유 이용권 사용
  const [mode, setMode] = useState<'buy' | 'use'>('buy');
  const [step, setStep] = useState<'plan' | 'form'>('plan');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [remainingAfter, setRemainingAfter] = useState(0);

  const [jobCategory, setJobCategory] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)].slice(0, 3));
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!selectedPlan) return;

    if (mode === 'buy') {
      // 구매 → 3장 지급 후 1장 즉시 사용
      purchaseTickets(selectedPlan);
      setRemainingAfter(TICKETS_PER_PURCHASE - 1);
    } else {
      // 보유 이용권 1장 차감
      useTicket(selectedPlan);
      setRemainingAfter(tickets[selectedPlan] - 1);
    }
    setShowCompleteModal(true);
  };

  const goToPlanStep = (planId: keyof TicketState, m: 'buy' | 'use') => {
    setSelectedPlan(planId);
    setMode(m);
    if (!user) { navigate('/login'); return; }
    setStep('form');
  };

  /* 잔여 티켓 원형 배지 */
  const TicketBadge = ({ count, accent }: { count: number; accent: string }) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: count > 0 ? accent : '#e5e7eb',
        color: count > 0 ? '#fff' : '#9ca3af',
        fontSize: 13,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {count}
    </span>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span
          style={{
            display: 'inline-block',
            background: 'var(--color-brand)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 14px',
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          전문가 1:1 피드백
        </span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 12 }}>
          합격을 앞당기는 피드백 서비스
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 16, lineHeight: 1.7 }}>
          이용권 <strong>3회</strong>를 한 번에 구매하고, 원할 때마다 사용하세요.
          <br />
          면접 영상 또는 서류를 올리면 현직 전문가가 피드백을 제공합니다.
        </p>
      </div>

      {/* ── STEP 1: 플랜 선택 ── */}
      {step === 'plan' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              marginBottom: 40,
            }}
          >
            {PLANS.map((p) => {
              const remaining = tickets[p.id];
              return (
                <div
                  key={p.id}
                  style={{
                    position: 'relative',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    background: '#fff',
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden',
                  }}
                >
                  {p.recommended && (
                    <div
                      style={{
                        background: p.accent,
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '5px 0',
                        letterSpacing: 0.5,
                      }}
                    >
                      추천 플랜
                    </div>
                  )}

                  <div style={{ padding: '24px 22px' }}>
                    {/* 아이콘 + 제목 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 32 }}>{p.icon}</span>
                      <div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{p.name}</h3>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: p.accent,
                            background: `${p.accent}18`,
                            padding: '2px 8px',
                            borderRadius: 10,
                          }}
                        >
                          3회 이용권
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                      {p.desc}
                    </p>

                    {/* 기능 목록 */}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {p.features.map((f) => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13 }}>
                          <span style={{ color: p.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* 가격 표시 */}
                    <div
                      style={{
                        background: 'var(--color-bg)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 2 }}>3회 패키지</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: p.accent }}>
                          {formatPrice(p.price)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 2 }}>회당 단가</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-muted)' }}>
                          {formatPrice(p.unitPrice)}
                        </div>
                      </div>
                    </div>

                    {/* 잔여 이용권 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: remaining > 0 ? `${p.accent}10` : '#f9fafb',
                        border: `1px solid ${remaining > 0 ? `${p.accent}40` : 'var(--color-border)'}`,
                        borderRadius: 8,
                        marginBottom: 14,
                        fontSize: 13,
                      }}
                    >
                      <TicketBadge count={remaining} accent={p.accent} />
                      <span style={{ color: remaining > 0 ? p.accent : 'var(--color-muted)', fontWeight: remaining > 0 ? 700 : 400 }}>
                        {remaining > 0 ? `잔여 이용권 ${remaining}회` : '보유 이용권 없음'}
                      </span>
                    </div>

                    {/* 버튼 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => goToPlanStep(p.id, 'buy')}
                        style={{
                          width: '100%',
                          padding: '11px 0',
                          background: p.accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {formatPrice(p.price)} 결제하고 3회 구매
                      </button>
                      {remaining > 0 && (
                        <button
                          type="button"
                          onClick={() => goToPlanStep(p.id, 'use')}
                          style={{
                            width: '100%',
                            padding: '10px 0',
                            background: '#fff',
                            color: p.accent,
                            border: `1.5px solid ${p.accent}`,
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          보유 이용권 사용 ({remaining}회 남음)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── STEP 2: 신청 폼 ── */}
      {step === 'form' && plan && (
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* 선택 플랜 요약 배너 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '14px 20px',
              background: mode === 'use' ? '#f0fdf4' : 'var(--color-brand-soft)',
              border: `1px solid ${mode === 'use' ? 'var(--color-brand)' : 'var(--color-brand)'}`,
              borderRadius: 'var(--radius-lg)',
              marginBottom: 28,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>{plan.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                  {mode === 'buy'
                    ? `${formatPrice(plan.price)} 결제 → 이용권 3회 지급`
                    : `보유 이용권 1회 차감 (현재 ${tickets[plan.id]}회 보유)`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('plan')}
              style={{ fontSize: 13, color: 'var(--color-brand-dark)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              변경
            </button>
          </div>

          {/* 직무 · 피드백 유형 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                직무 선택 <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                className="ui-select"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                required
              >
                <option value="">직무를 선택하세요</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                피드백 유형 <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                className="ui-select"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                required
              >
                <option value="">유형을 선택하세요</option>
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 파일 업로드 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              파일 업로드 (최대 3개)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--color-brand)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--color-brand-soft)' : '#fafafa',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>파일을 드래그하거나 클릭해서 업로드</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>
                영상(mp4, mov), 문서(pdf, docx, hwp) · 파일당 최대 500MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp4,.mov,.pdf,.docx,.hwp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            {files.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {files.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px',
                      background: '#fff',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <span>📎 {f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 16 }}
                    >✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 요청 사항 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>요청 사항</label>
            <textarea
              className="ui-textarea"
              rows={4}
              placeholder="전문가에게 전달할 내용을 자유롭게 적어주세요. (지원 직무, 걱정되는 부분, 특별히 봐줬으면 하는 항목 등)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ resize: 'vertical', fontSize: 14 }}
            />
          </div>

          {/* 결제 요약 */}
          <div
            style={{
              padding: '18px 22px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 20,
            }}
          >
            {mode === 'buy' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: 'var(--color-muted)' }}>
                  <span>{plan.name} 3회 이용권</span>
                  <span>{formatPrice(plan.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: 'var(--color-muted)' }}>
                  <span>이번 신청 시 1회 즉시 사용</span>
                  <span style={{ color: 'var(--color-error)' }}>-1회</span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: 17,
                  }}
                >
                  <span>최종 결제 금액</span>
                  <span style={{ color: 'var(--color-brand)' }}>{formatPrice(plan.price)}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-muted)' }}>
                  결제 후 잔여 이용권 <strong style={{ color: plan.accent }}>{TICKETS_PER_PURCHASE - 1}회</strong> 가 내 강의실에 적립됩니다.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: 'var(--color-muted)' }}>
                  <span>현재 보유 이용권</span>
                  <span>{tickets[plan.id]}회</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, color: 'var(--color-muted)' }}>
                  <span>이번 신청 차감</span>
                  <span style={{ color: 'var(--color-error)' }}>-1회</span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: 17,
                  }}
                >
                  <span>신청 후 잔여</span>
                  <span style={{ color: plan.accent }}>{tickets[plan.id] - 1}회</span>
                </div>
              </>
            )}
          </div>

          <Button
            type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '15px 0', fontSize: 16 }}
          >
            {mode === 'buy' ? `${formatPrice(plan.price)} 결제하고 피드백 신청` : '보유 이용권으로 피드백 신청'}
          </Button>
        </form>
      )}

      {/* 완료 모달 */}
      <Modal
        open={showCompleteModal}
        onClose={() => { setShowCompleteModal(false); navigate('/dashboard'); }}
        title="피드백 신청 완료!"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => { setShowCompleteModal(false); setStep('plan'); setJobCategory(''); setFeedbackType(''); setNote(''); setFiles([]); }}>
              추가 신청
            </Button>
            <Button onClick={() => { setShowCompleteModal(false); navigate('/dashboard'); }}>
              내 강의실로 이동
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
          <p style={{ margin: '0 0 16px', lineHeight: 1.75 }}>
            <strong>{plan?.name}</strong> 신청이 완료되었습니다.
            <br />
            {plan?.features[plan.features.length - 1]} 내에 전문가 피드백을 보내드립니다.
          </p>
          {/* 잔여 이용권 현황 */}
          <div
            style={{
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid var(--color-brand)',
              borderRadius: 10,
              fontSize: 14,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>🎟️ 잔여 이용권</div>
            <div style={{ color: 'var(--color-brand)', fontWeight: 800, fontSize: 18 }}>
              {plan?.name} · {remainingAfter}회 남음
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
              내 강의실에서 언제든지 사용할 수 있습니다.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
