import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import type { TicketState } from '../hooks/useFeedbackTickets';
import { api } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { FileText, Video, Award, Lock, Ticket, CheckCircle2, X, UploadCloud } from 'lucide-react';

const PLAN_ICONS: Record<string, React.ElementType> = {
  doc: FileText, video: Video, premium: Award,
};

const PLAN_META: { id: keyof TicketState; name: string; accent: string }[] = [
  { id: 'doc',     name: '문서 피드백', accent: '#2563EB' },
  { id: 'video',   name: '영상 피드백', accent: '#16a34a' },
  { id: 'premium', name: '심층 피드백', accent: '#7c3aed' },
];

const JOB_CATEGORIES = [
  'IT개발', '금융/은행', '마케팅/광고', '영업', '의료/간호',
  '공무원/공기업', '교육/강사', '디자인', '경영/기획', '법률/회계',
];

const FEEDBACK_TYPES = ['자기소개서', '이력서', '포트폴리오', '면접 영상', '기타'];

export default function FeedbackNew() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.user.user);
  const { tickets, useTicket } = useFeedbackTickets(!!user);

  const [selectedPlan, setSelectedPlan] = useState<keyof TicketState | null>(null);
  const [jobCategory, setJobCategory] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalTickets = tickets.doc + tickets.video + tickets.premium;
  const plan = PLAN_META.find((p) => p.id === selectedPlan);
  const remaining = selectedPlan ? tickets[selectedPlan] : 0;

  if (!user) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={28} color="var(--color-neutral-400)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>로그인이 필요합니다</h2>
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 28, fontSize: 14 }}>피드백 신청은 로그인 후 이용하실 수 있습니다.</p>
        <Link to="/login"><Button size="lg">로그인하러 가기</Button></Link>
      </div>
    );
  }

  if (totalTickets === 0) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-warning-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Ticket size={30} color="var(--color-warning-600)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>보유한 이용권이 없습니다</h2>
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 28, fontSize: 14 }}>
          피드백 신청 전 이용권을 먼저 구매해주세요.
        </p>
        <Link to="/feedback/buy"><Button size="lg">이용권 구매하러 가기</Button></Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)].slice(0, 5));
  };
  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !jobCategory || !feedbackType) return;
    if (remaining <= 0) return;
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    if (!selectedPlan || !plan) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await (api as any).feedback.create({
        planId: selectedPlan,
        jobCategory,
        feedbackType,
        note,
        files,
      });
      useTicket(selectedPlan);
      setShowConfirmModal(false);
      setShowDoneModal(true);
    } catch (err: any) {
      setSubmitError(err?.message || '피드백 신청에 실패했습니다. 다시 시도해 주세요.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      {/* 브레드크럼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-muted)', marginBottom: 32 }}>
        <Link to="/feedback" style={{ color: 'var(--color-muted)' }}>피드백</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>피드백 신청</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>피드백 신청</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>보유한 이용권을 사용하여 피드백을 신청합니다.</p>

      <form onSubmit={handleSubmit} autoComplete="off">

        {/* ① 이용권 선택 */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>① 이용권 선택</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLAN_META.map((p) => {
              const count = tickets[p.id];
              const isSelected = selectedPlan === p.id;
              return (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    border: `2px solid ${isSelected ? p.accent : count > 0 ? 'var(--color-border)' : '#f0f0f0'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? `${p.accent}08` : count > 0 ? '#fff' : '#fafafa',
                    cursor: count > 0 ? 'pointer' : 'not-allowed',
                    opacity: count > 0 ? 1 : 0.45,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    disabled={count <= 0}
                    checked={isSelected}
                    onChange={() => setSelectedPlan(p.id)}
                    style={{ accentColor: p.accent }}
                  />
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${p.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(() => { const Icon = PLAN_ICONS[p.id]; return <Icon size={18} color={p.accent} />; })()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  </div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: count > 0 ? p.accent : '#9ca3af',
                      background: count > 0 ? `${p.accent}18` : '#f3f4f6',
                      padding: '4px 12px',
                      borderRadius: 20,
                    }}
                  >
                    {count > 0 ? `${count}회 보유` : '없음'}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* ② 직무 / 유형 */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>② 직무 및 피드백 유형</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                직무 선택 <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select className="ui-select" value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} required>
                <option value="">직무 선택</option>
                {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                피드백 유형 <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select className="ui-select" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} required>
                <option value="">유형 선택</option>
                {FEEDBACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* ③ 파일 업로드 */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>③ 파일 업로드</h2>
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
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: dragging ? 'var(--color-primary-500)' : 'var(--color-neutral-400)' }}>
              <UploadCloud size={36} strokeWidth={1.5} />
            </div>
            <p style={{ margin: 0, fontWeight: 600 }}>파일을 드래그하거나 클릭해서 업로드</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>
              영상(mp4, mov), 문서(pdf, docx, hwp) · 파일당 최대 500MB · 최대 5개
            </p>
            <input ref={fileInputRef} type="file" multiple accept=".mp4,.mov,.pdf,.docx,.hwp" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
          {files.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {files.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><FileText size={14} color="var(--color-neutral-400)" /> {f.name} <span style={{ color: 'var(--color-neutral-400)', fontSize: 12 }}>({(f.size / 1024 / 1024).toFixed(1)} MB)</span></span>
                  <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--color-error-500)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ④ 요청 사항 */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>④ 요청 사항</h2>
          <textarea
            className="ui-textarea"
            rows={5}
            placeholder="전문가에게 전달할 내용을 자유롭게 적어주세요.&#10;예: 지원 직무, 걱정되는 부분, 특별히 봐줬으면 하는 항목, 지원 기업 등"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ resize: 'vertical', fontSize: 14 }}
          />
        </section>

        {/* 신청 요약 */}
        {selectedPlan && plan && (
          <div style={{ padding: '16px 20px', background: '#f0fdf4', border: '1px solid var(--color-brand)', borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
              <span style={{ color: 'var(--color-muted)' }}>사용 이용권</span>
              <span style={{ fontWeight: 700 }}>{plan.name} 1회 차감</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--color-muted)' }}>신청 후 잔여</span>
              <span style={{ fontWeight: 700, color: plan.accent }}>{remaining - 1}회</span>
            </div>
          </div>
        )}

        {submitError && (
          <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: 13 }}>
            {submitError}
          </div>
        )}
        <Button
          type="submit"
          disabled={submitting}
          loading={submitting}
          style={{ width: '100%', justifyContent: 'center', padding: '15px 0', fontSize: 16, opacity: (selectedPlan && jobCategory && feedbackType) ? 1 : 0.45 }}
        >
          {submitting ? '신청 중...' : '피드백 신청하기'}
        </Button>
      </form>

      {/* 신청 확인 모달 */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="신청 내용 확인"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>취소</Button>
            <Button onClick={confirmSubmit}>신청 확정</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
          {[
            { label: '이용권', value: `${plan?.name}` },
            { label: '직무', value: jobCategory },
            { label: '피드백 유형', value: feedbackType },
            { label: '첨부 파일', value: files.length > 0 ? `${files.length}개` : '없음' },
          ].map((r) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted)' }}>{r.label}</span>
              <span style={{ fontWeight: 600 }}>{r.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 4, padding: '10px 12px', background: '#fef3c7', borderRadius: 8, fontSize: 13 }}>
            ⚠️ 신청 후 <strong>{plan?.name} 이용권 1회</strong>가 즉시 차감됩니다.
          </div>
        </div>
      </Modal>

      {/* 완료 모달 */}
      <Modal
        open={showDoneModal}
        onClose={() => { setShowDoneModal(false); navigate('/feedback/history'); }}
        title="피드백 신청 완료"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => { setShowDoneModal(false); navigate('/feedback'); }}>
              피드백 홈
            </Button>
            <Button onClick={() => { setShowDoneModal(false); navigate('/feedback/history'); }}>
              내 신청 내역 보기
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={36} color="var(--color-success-600)" />
          </div>
          <p style={{ margin: '0 0 16px', lineHeight: 1.75, fontSize: 15 }}>
            피드백 신청이 완료되었습니다.
            <br />전문가 검토 후 답변을 보내드립니다.
          </p>
          {plan && selectedPlan && (
            <div style={{ padding: '14px 18px', background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)', borderRadius: 'var(--radius-lg)', fontSize: 14 }}>
              <div style={{ color: 'var(--color-success-700)', fontWeight: 700 }}>
                {plan.name} 잔여 이용권: {tickets[selectedPlan]}회
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
