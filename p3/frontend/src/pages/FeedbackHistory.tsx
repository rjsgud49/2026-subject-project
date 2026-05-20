import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { useRedirectIfNotStudentFeedback } from '../hooks/useRedirectIfNotStudentFeedback';
import { api } from '../services/api';
import Button from '../components/Button';
import {
  FileText, Video, Award, Lock, Inbox, Paperclip,
  Mail, Search, CheckCircle2, ChevronUp, ChevronDown, AlertCircle, MessageCircle,
} from 'lucide-react';
import { formatDate } from '../utils/format';

type SubmissionStatus = 'pending' | 'in_progress' | 'completed';

interface ThreadMsg {
  role: 'student' | 'teacher';
  body: string;
  at: string;
}

interface Submission {
  id: number;
  planId: string;
  planName: string;
  jobCategory: string;
  feedbackType: string;
  note: string | null;
  fileNames: string[];
  status: SubmissionStatus;
  createdAt: string;
  thread?: ThreadMsg[];
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  doc: FileText, video: Video, premium: Award,
};
const PLAN_COLORS: Record<string, string> = {
  doc: '#2563EB', video: '#16a34a', premium: '#7c3aed',
};
const PLAN_BGS: Record<string, string> = {
  doc: '#EFF6FF', video: '#F0FDF4', premium: '#F5F3FF',
};

const STATUS_META: Record<SubmissionStatus, {
  label: string; color: string; bg: string; step: number;
  Icon: React.ElementType;
}> = {
  pending:     { label: '접수 완료', color: '#b45309', bg: '#fef3c7', step: 1, Icon: Mail },
  in_progress: { label: '검토 중',   color: '#1d4ed8', bg: '#dbeafe', step: 2, Icon: Search },
  completed:   { label: '완료',      color: '#065f46', bg: '#d1fae5', step: 3, Icon: CheckCircle2 },
};

const STEPS = [
  { key: 'pending',     label: '접수 완료' },
  { key: 'in_progress', label: '전문가 검토 중' },
  { key: 'completed',   label: '피드백 완료' },
];

function ProgressStepper({ status }: { status: SubmissionStatus }) {
  const currentStep = STATUS_META[status]?.step ?? 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {STEPS.map((s, i) => {
        const done   = currentStep > i + 1;
        const active = currentStep === i + 1;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? 'var(--color-success-600)' : active ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}
              >
                {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontWeight: active ? 700 : 400,
                color: active ? 'var(--color-primary-600)' : done ? 'var(--color-success-600)' : 'var(--color-neutral-400)',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? 'var(--color-success-400)' : 'var(--color-neutral-200)', margin: '0 6px', marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubmissionCard({ sub }: { sub: Submission }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_META[sub.status] ?? STATUS_META.pending;
  const PlanIcon = PLAN_ICONS[sub.planId] ?? FileText;
  const planColor = PLAN_COLORS[sub.planId] ?? 'var(--color-neutral-500)';
  const planBg    = PLAN_BGS[sub.planId]    ?? 'var(--color-neutral-100)';

  return (
    <div
      style={{
        border: '1px solid var(--color-neutral-200)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-neutral-0)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: expanded ? '1px solid var(--color-neutral-200)' : undefined,
          transition: 'background 100ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {/* 플랜 아이콘 */}
        <div style={{ width: 40, height: 40, borderRadius: 10, background: planBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PlanIcon size={20} color={planColor} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-neutral-800)' }}>{sub.planName}</span>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>· {sub.feedbackType}</span>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>· {sub.jobCategory}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)', marginTop: 3 }}>
            신청일: {new Date(sub.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link
            to={`/student/feedback/${sub.id}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-primary-600)',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-200)',
              background: 'var(--color-neutral-0)',
            }}
          >
            <MessageCircle size={15} />
            문담
          </Link>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
            <st.Icon size={12} />
            {st.label}
          </span>
          {expanded
            ? <ChevronUp size={16} color="var(--color-neutral-400)" />
            : <ChevronDown size={16} color="var(--color-neutral-400)" />
          }
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px' }}>
          <div
            style={{
              marginBottom: 18,
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-neutral-200)',
              background: 'var(--color-neutral-50)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={18} color="var(--color-primary-500)" />
              문답
            </div>
            {(sub.thread?.length ?? 0) > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {sub.thread!.slice(-6).map((m, i) => (
                    <div
                      key={`${m.at}-${i}`}
                      style={{
                        alignSelf: m.role === 'student' ? 'flex-end' : 'flex-start',
                        maxWidth: '92%',
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: m.role === 'student' ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
                        border: `1px solid ${m.role === 'student' ? 'var(--color-primary-200)' : 'var(--color-neutral-200)'}`,
                        fontSize: 13,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
                        {m.role === 'student' ? '나' : '강사'} · {formatDate(m.at)}
                      </div>
                      {m.body}
                    </div>
                  ))}
                </div>
                <Link
                  to={`/student/feedback/${sub.id}`}
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary-600)' }}
                >
                  전체 문담에서 답장하기 →
                </Link>
              </>
            ) : (
              <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.55 }}>
                아직 주고받은 문답이 없습니다. 강사가 메시지를 내면 여기에 표시됩니다.
              </p>
            )}
            <div style={{ marginTop: 10 }}>
              <Link to={`/student/feedback/${sub.id}`}>
                <Button size="sm" variant="secondary" style={{ display: 'inline-flex', gap: 6 }}>
                  <MessageCircle size={15} />
                  학생 문담 화면 열기
                </Button>
              </Link>
            </div>
          </div>

          <ProgressStepper status={sub.status} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: '피드백 플랜', value: sub.planName },
              { label: '직무', value: sub.jobCategory },
              { label: '피드백 유형', value: sub.feedbackType },
              { label: '첨부 파일', value: sub.fileNames.length > 0 ? `${sub.fileNames.length}개` : '없음' },
            ].map((r) => (
              <div key={r.label} style={{ background: 'var(--color-neutral-50)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-700)' }}>{r.value}</div>
              </div>
            ))}
          </div>

          {sub.fileNames.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>첨부 파일</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sub.fileNames.map((fn, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--color-neutral-50)', borderRadius: 6, fontSize: 13, color: 'var(--color-neutral-700)' }}>
                    <Paperclip size={13} color="var(--color-neutral-400)" />
                    {fn}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sub.note && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--color-neutral-700)' }}>요청 사항</div>
              <p style={{ margin: 0, padding: '12px 14px', background: 'var(--color-neutral-50)', borderRadius: 8, fontSize: 13, lineHeight: 1.7, color: 'var(--color-neutral-700)' }}>
                {sub.note}
              </p>
            </div>
          )}

          {sub.status === 'pending' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 'var(--radius-lg)', fontSize: 13, color: '#92400e' }}>
              <Mail size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              신청이 접수되었습니다. 곧 전문가 배정 후 검토가 시작됩니다.
            </div>
          )}
          {sub.status === 'in_progress' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 'var(--radius-lg)', fontSize: 13, color: '#1e40af' }}>
              <Search size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              전문가가 현재 검토 중입니다. 조금만 기다려주세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackHistory() {
  useRedirectIfNotStudentFeedback();
  const user = useAppSelector((s) => s.user.user);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (api as any).feedback.list()
      .then((data: Submission[]) => setSubmissions(data ?? []))
      .catch((err: any) => setError(err?.message || '목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={28} color="var(--color-neutral-400)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>로그인이 필요합니다</h2>
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 28, fontSize: 14 }}>신청 내역은 로그인 후 확인할 수 있습니다.</p>
        <Link to="/login"><Button size="lg">로그인하러 가기</Button></Link>
      </div>
    );
  }

  const filtered = statusFilter === 'all' ? submissions : submissions.filter((s) => s.status === statusFilter);
  const counts = {
    all:         submissions.length,
    pending:     submissions.filter((s) => s.status === 'pending').length,
    in_progress: submissions.filter((s) => s.status === 'in_progress').length,
    completed:   submissions.filter((s) => s.status === 'completed').length,
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      {/* 브레드크럼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 32 }}>
        <Link to="/feedback" style={{ color: 'var(--color-neutral-600)' }}>피드백</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-neutral-900)', fontWeight: 600 }}>신청 내역</span>
      </div>

      <div
        style={{
          marginBottom: 24,
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-primary-200)',
          background: 'var(--color-primary-50)',
          fontSize: 14,
          color: 'var(--color-neutral-800)',
          lineHeight: 1.6,
        }}
      >
        <strong>강사와의 문답</strong>은 아래 각 건의 <strong>「문담」</strong> 또는{' '}
        <Link to="/student/feedback" style={{ fontWeight: 700, color: 'var(--color-primary-700)' }}>
          학생 메뉴 → 내 피드백
        </Link>
        에서 동일하게 확인·답장할 수 있습니다.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: 'var(--color-neutral-900)' }}>내 피드백 신청 내역</h1>
          <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 14 }}>총 {submissions.length}건의 신청 내역</p>
        </div>
        <Link to="/feedback/new"><Button size="sm">+ 새 피드백 신청</Button></Link>
      </div>

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {([
          { key: 'all',         label: '전체',     count: counts.all },
          { key: 'pending',     label: '접수 완료', count: counts.pending },
          { key: 'in_progress', label: '검토 중',   count: counts.in_progress },
          { key: 'completed',   label: '완료',      count: counts.completed },
        ] as const).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${statusFilter === f.key ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
              background: statusFilter === f.key ? 'var(--color-primary-500)' : 'var(--color-neutral-0)',
              color: statusFilter === f.key ? '#fff' : 'var(--color-neutral-700)',
              fontWeight: statusFilter === f.key ? 700 : 400,
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit', transition: 'all 150ms',
            }}
          >
            {f.label}
            <span style={{ background: statusFilter === f.key ? 'rgba(255,255,255,0.3)' : 'var(--color-neutral-100)', borderRadius: 'var(--radius-full)', padding: '0 6px', fontSize: 12, fontWeight: 700 }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 76, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', background: 'var(--color-error-50)', border: '1px solid var(--color-error-200)', borderRadius: 'var(--radius-lg)', color: 'var(--color-error-700)', fontSize: 14 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Inbox size={48} strokeWidth={1.2} color="var(--color-neutral-300)" />
          </div>
          <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--color-neutral-500)', fontWeight: 500 }}>해당 상태의 신청 내역이 없습니다.</p>
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
