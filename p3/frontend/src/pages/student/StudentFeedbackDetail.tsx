import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type FeedbackRow, type FeedbackThreadMsg } from '../../lib/api';
import { formatDate } from '../../utils/format';
import Button from '../../components/Button';

function ThreadBubble({ m }: { m: FeedbackThreadMsg }) {
  const mine = m.role === 'student';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: mine ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: 12,
          background: mine ? 'var(--color-primary-50)' : 'var(--color-neutral-100)',
          border: `1px solid ${mine ? 'var(--color-primary-200)' : 'var(--color-neutral-200)'}`,
          fontSize: 14,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
          {mine ? '나' : '강사'} · {formatDate(m.at)}
        </div>
        {m.body}
      </div>
    </div>
  );
}

export default function StudentFeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const fid = Number(id);
  const [row, setRow] = useState<FeedbackRow | null>(null);
  const [err, setErr] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(fid)) {
      setErr('잘못된 요청입니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    api.feedback
      .get(fid)
      .then(setRow)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [fid]);

  async function sendReply() {
    if (!row || !reply.trim()) return;
    setErr('');
    setSending(true);
    try {
      const next = await api.feedback.addMessage(Number(row.id), reply.trim());
      setRow(next);
      setReply('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '전송 실패');
    } finally {
      setSending(false);
    }
  }

  const closed = row?.status === 'answered';

  if (loading) {
    return (
      <div className="page-pad page-pad--thread">
        <p className="muted">불러오는 중…</p>
      </div>
    );
  }

  if (err && !row) {
    return (
      <div className="page-pad page-pad--thread">
        <div className="alert error">{err}</div>
        <Link to="/student/feedback">목록으로</Link>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="page-pad page-pad--thread">
        <div className="alert error">건을 찾을 수 없습니다.</div>
        <Link to="/student/feedback">목록으로</Link>
      </div>
    );
  }

  const thread = row.thread ?? [];

  return (
    <div className="page-pad page-pad--thread">
      <div style={{ marginBottom: 16 }}>
        <Link to="/student/feedback" className="muted small">
          ← 내 피드백 목록
        </Link>
      </div>
      <h1 className="page-title" style={{ marginBottom: 6 }}>
        {row.title}
      </h1>
      <p className="muted small" style={{ marginBottom: 20 }}>
        요청일 {formatDate(row.created_at)}
        {closed ? (
          <span style={{ marginLeft: 8, color: 'var(--color-success-700)', fontWeight: 600 }}>· 완료됨</span>
        ) : (
          <span style={{ marginLeft: 8, fontWeight: 600 }}>· 진행 중</span>
        )}
      </p>

      {err && <div className="alert error" style={{ marginBottom: 12 }}>{err}</div>}

      <section className="card" style={{ marginBottom: 20, padding: 18 }}>
        <div className="small muted" style={{ marginBottom: 8 }}>
          최초 요청
        </div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 15 }}>{row.student_question}</p>
        {(row.student_attachments?.length ?? 0) > 0 && (
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
            {row.student_attachments!.map((a) => (
              <li key={a.url} style={{ marginTop: 6 }}>
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  {a.filename || '첨부'}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(row.teacher_question || row.teacher_feedback) && (
        <section className="card" style={{ marginBottom: 20, padding: 18 }}>
          {row.teacher_question ? (
            <div style={{ marginBottom: 14 }}>
              <div className="small muted">강사 질의 (정리용)</div>
              <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{row.teacher_question}</p>
            </div>
          ) : null}
          {row.teacher_feedback ? (
            <div>
              <div className="small muted">최종 피드백</div>
              <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{row.teacher_feedback}</p>
            </div>
          ) : null}
        </section>
      )}

      <section className="card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>문답</h2>
        {thread.length === 0 ? (
          <p className="muted small" style={{ marginBottom: 12 }}>
            아직 주고받은 메시지가 없습니다. 강사 답장을 기다리거나 아래에서 이어서 작성할 수 있습니다.
          </p>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {thread.map((m, i) => (
              <ThreadBubble key={`${m.at}-${i}`} m={m} />
            ))}
          </div>
        )}

        {!closed ? (
          <>
            <label className="small muted" style={{ display: 'block', marginBottom: 6 }}>
              답장
            </label>
            <textarea
              className="ui-textarea"
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="선생님께 보낼 메시지"
            />
            <div style={{ marginTop: 10 }}>
              <Button loading={sending} disabled={sending || !reply.trim()} onClick={() => void sendReply()}>
                보내기
              </Button>
            </div>
          </>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>
            이 피드백은 강사에 의해 완료 처리되어 더 이상 답장할 수 없습니다.
          </p>
        )}
      </section>
    </div>
  );
}
