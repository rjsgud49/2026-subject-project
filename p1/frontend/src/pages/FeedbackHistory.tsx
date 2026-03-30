import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useFeedbackSubmissions } from '../hooks/useFeedbackSubmissions';
import type { FeedbackSubmission, SubmissionStatus } from '../hooks/useFeedbackSubmissions';
import Button from '../components/Button';

const STATUS_META: Record<SubmissionStatus, { label: string; color: string; bg: string; icon: string; step: number }> = {
  pending:     { label: '접수 완료', color: '#b45309', bg: '#fef3c7', icon: '📬', step: 1 },
  in_progress: { label: '검토 중',   color: '#1d4ed8', bg: '#dbeafe', icon: '🔍', step: 2 },
  completed:   { label: '완료',      color: '#065f46', bg: '#d1fae5', icon: '✅', step: 3 },
};

const STEPS = [
  { key: 'pending',     label: '접수 완료' },
  { key: 'in_progress', label: '전문가 검토 중' },
  { key: 'completed',   label: '피드백 완료' },
];

function ProgressStepper({ status }: { status: SubmissionStatus }) {
  const currentStep = STATUS_META[status].step;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {STEPS.map((s, i) => {
        const done = currentStep > i + 1;
        const active = currentStep === i + 1;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? '#00c73c' : active ? '#1d4ed8' : '#e5e7eb',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? '#1d4ed8' : done ? '#00c73c' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#00c73c' : '#e5e7eb', margin: '0 6px', marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubmissionCard({ sub }: { sub: FeedbackSubmission }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_META[sub.status];

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        background: '#fff',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* 카드 헤더 */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: expanded ? '1px solid var(--color-border)' : undefined,
        }}
      >
        <span style={{ fontSize: 26, flexShrink: 0 }}>{sub.planIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{sub.planName}</span>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>· {sub.feedbackType}</span>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>· {sub.jobCategory}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 3 }}>
            신청일: {new Date(sub.submittedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            {sub.completedAt && ` · 완료: ${new Date(sub.completedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, padding: '4px 12px', borderRadius: 20 }}>
            {st.icon} {st.label}
          </span>
          <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* 확장 영역 */}
      {expanded && (
        <div style={{ padding: '20px' }}>
          <ProgressStepper status={sub.status} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: '피드백 플랜', value: sub.planName },
              { label: '직무', value: sub.jobCategory },
              { label: '피드백 유형', value: sub.feedbackType },
              { label: '첨부 파일', value: sub.fileNames.length > 0 ? `${sub.fileNames.length}개` : '없음' },
            ].map((r) => (
              <div key={r.label} style={{ background: 'var(--color-bg)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.value}</div>
              </div>
            ))}
          </div>

          {/* 첨부 파일 목록 */}
          {sub.fileNames.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>첨부 파일</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sub.fileNames.map((fn, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f9fafb', borderRadius: 6, fontSize: 13 }}>
                    <span>📎</span> {fn}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 요청 사항 */}
          {sub.note && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>요청 사항</div>
              <p style={{ margin: 0, padding: '12px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 13, lineHeight: 1.7, color: 'var(--color-text)' }}>
                {sub.note}
              </p>
            </div>
          )}

          {/* 전문가 피드백 */}
          {sub.status === 'completed' && sub.expertFeedback && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid var(--color-brand)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>👨‍💼</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-brand-dark)' }}>전문가 피드백</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--color-text)' }}>
                {sub.expertFeedback}
              </p>
            </div>
          )}

          {sub.status === 'in_progress' && (
            <div style={{ padding: '14px 16px', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 'var(--radius-lg)', fontSize: 13 }}>
              🔍 전문가가 현재 검토 중입니다. 조금만 기다려주세요.
            </div>
          )}

          {sub.status === 'pending' && (
            <div style={{ padding: '14px 16px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 'var(--radius-lg)', fontSize: 13 }}>
              📬 신청이 접수되었습니다. 곧 전문가 배정 후 검토가 시작됩니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackHistory() {
  const user = useAppSelector((s) => s.user.user);
  const { submissions } = useFeedbackSubmissions();
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');

  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2>로그인이 필요합니다</h2>
        <Link to="/login"><Button>로그인하러 가기</Button></Link>
      </div>
    );
  }

  const filtered = statusFilter === 'all' ? submissions : submissions.filter((s) => s.status === statusFilter);

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    in_progress: submissions.filter((s) => s.status === 'in_progress').length,
    completed: submissions.filter((s) => s.status === 'completed').length,
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      {/* 브레드크럼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-muted)', marginBottom: 32 }}>
        <Link to="/feedback" style={{ color: 'var(--color-muted)' }}>피드백</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>신청 내역</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>내 피드백 신청 내역</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 14 }}>총 {submissions.length}건의 신청 내역</p>
        </div>
        <Link to="/feedback/new"><Button size="sm">+ 새 피드백 신청</Button></Link>
      </div>

      {/* 상태 필터 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {([
          { key: 'all',         label: '전체',       count: counts.all },
          { key: 'pending',     label: '접수 완료',   count: counts.pending },
          { key: 'in_progress', label: '검토 중',     count: counts.in_progress },
          { key: 'completed',   label: '완료',        count: counts.completed },
        ] as const).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: `1.5px solid ${statusFilter === f.key ? 'var(--color-brand)' : 'var(--color-border)'}`,
              background: statusFilter === f.key ? 'var(--color-brand)' : '#fff',
              color: statusFilter === f.key ? '#fff' : 'inherit',
              fontWeight: statusFilter === f.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {f.label}
            <span
              style={{
                background: statusFilter === f.key ? 'rgba(255,255,255,0.3)' : 'var(--color-bg)',
                borderRadius: 10,
                padding: '0 6px',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
          <p style={{ margin: '0 0 20px' }}>해당 상태의 신청 내역이 없습니다.</p>
          <Link to="/feedback/new"><Button variant="secondary">피드백 신청하기</Button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((sub) => (
            <SubmissionCard key={sub.id} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
