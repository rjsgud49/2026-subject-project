import { useCallback, useEffect, useState } from 'react';
import { FileText, MessageCircle, Send } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { api, type FeedbackRow, type FeedbackThreadMsg } from '../../lib/api';
import { formatDate } from '../../utils/format';

const STATUS_OPTIONS_EDIT: { value: 'pending' | 'in_progress'; label: string }[] = [
  { value: 'pending', label: '대기' },
  { value: 'in_progress', label: '진행 중' },
];

function statusBadge(status: FeedbackRow['status']) {
  const map: Record<FeedbackRow['status'], { bg: string; fg: string; label: string }> = {
    pending: { bg: 'var(--color-warning-50)', fg: 'var(--color-warning-800)', label: '대기' },
    in_progress: { bg: 'var(--color-primary-50)', fg: 'var(--color-primary-700)', label: '진행 중' },
    answered: { bg: 'var(--color-success-50)', fg: 'var(--color-success-800)', label: '완료' },
  };
  const s = map[status];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: s.bg,
        color: s.fg,
      }}
    >
      {s.label}
    </span>
  );
}

function ThreadBubble({ m }: { m: FeedbackThreadMsg }) {
  const teacher = m.role === 'teacher';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: teacher ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: 12,
          background: teacher ? 'var(--color-neutral-100)' : 'var(--color-primary-50)',
          border: `1px solid ${teacher ? 'var(--color-neutral-200)' : 'var(--color-primary-200)'}`,
          fontSize: 14,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
          {teacher ? '나(강사)' : '학생'} · {formatDate(m.at)}
        </div>
        {m.body}
      </div>
    </div>
  );
}

export default function TeacherFeedback() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [status, setStatus] = useState<'pending' | 'in_progress'>('in_progress');
  const [teacherQuestion, setTeacherQuestion] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeAck, setCompleteAck] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(() => {
    setLoadingList(true);
    return api.teacherFeedback
      .list()
      .then((data) => {
        setRows(data);
        setSelected((prev) => {
          if (!data.length) return null;
          if (prev) {
            const found = data.find((r) => Number(r.id) === Number(prev.id));
            return found ?? data[0];
          }
          return data[0];
        });
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshOne = useCallback(async (id: number) => {
    const full = await api.teacherFeedback.get(id);
    setSelected(full);
    setRows((prev) => prev.map((r) => (Number(r.id) === id ? full : r)));
  }, []);

  useEffect(() => {
    if (!selected) return;
    if (selected.status !== 'answered') {
      setStatus(selected.status === 'pending' ? 'pending' : 'in_progress');
    }
    setTeacherQuestion(selected.teacher_question ?? '');
    setTeacherFeedback(selected.teacher_feedback ?? '');
    setReplyBody('');
  }, [selected?.id, selected?.updated_at, selected?.status]);

  async function pick(row: FeedbackRow) {
    setMsg('');
    setErr('');
    try {
      await refreshOne(Number(row.id));
    } catch (e: unknown) {
      setSelected(row);
      setErr(e instanceof Error ? e.message : '불러오기 실패');
    }
  }

  async function save() {
    if (!selected || selected.status === 'answered') return;
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      const updated = await api.teacherFeedback.update(Number(selected.id), {
        status,
        teacherQuestion,
        teacherFeedback,
      });
      setMsg('저장되었습니다.');
      setSelected(updated);
      await load();
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  async function sendThreadReply() {
    if (!selected || !replyBody.trim() || selected.status === 'answered') return;
    setErr('');
    setMsg('');
    setSendingReply(true);
    try {
      await api.teacherFeedback.addMessage(Number(selected.id), replyBody.trim());
      setReplyBody('');
      setMsg('답장을 보냈습니다.');
      await refreshOne(Number(selected.id));
      await load();
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '전송 실패');
    } finally {
      setSendingReply(false);
    }
  }

  async function confirmCompleteFeedback() {
    if (!selected || !completeAck) return;
    const tf = teacherFeedback.trim();
    if (!tf) {
      setErr('완료 전에 최종 피드백 내용을 입력해 주세요.');
      return;
    }
    setErr('');
    setCompleting(true);
    try {
      const updated = await api.teacherFeedback.update(Number(selected.id), {
        status: 'answered',
        confirmComplete: true,
        teacherQuestion,
        teacherFeedback: tf,
      });
      setSelected(updated);
      setCompleteOpen(false);
      setCompleteAck(false);
      setMsg('피드백이 완료 처리되었습니다. 이후 수정·문답이 불가합니다.');
      await load();
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '완료 처리 실패');
    } finally {
      setCompleting(false);
    }
  }

  const thread = selected?.thread ?? [];
  const isClosed = selected?.status === 'answered';

  return (
    <TeacherWorkspace
      title="피드백 관리"
      subtitle="학생 최초 요청과 문답 스레드로 소통한 뒤, 최종 피드백을 작성하고 완료 처리하세요. 완료 후에는 다시 열 수 없습니다."
    >
      {err && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-50)',
            border: '1px solid var(--color-error-100)',
            color: 'var(--color-error-700)',
            fontSize: 14,
          }}
        >
          {err}
        </div>
      )}
      {msg && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-50)',
            border: '1px solid var(--color-success-100)',
            color: 'var(--color-success-800)',
            fontSize: 14,
          }}
        >
          {msg}
        </div>
      )}

      <Modal
        open={completeOpen}
        onClose={() => {
          if (!completing) {
            setCompleteOpen(false);
            setCompleteAck(false);
          }
        }}
        title="피드백을 완료하겠습니까?"
        footer={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              disabled={completing}
              onClick={() => {
                setCompleteOpen(false);
                setCompleteAck(false);
              }}
            >
              취소
            </Button>
            <Button
              disabled={!completeAck || completing || !teacherFeedback.trim()}
              loading={completing}
              onClick={() => void confirmCompleteFeedback()}
            >
              완료 확정
            </Button>
          </div>
        }
      >
        <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>
          <strong>다시 열 수 없습니다.</strong> 완료 후에는 학생과의 문답·내용 수정이 모두 종료됩니다. 합의가 끝난 뒤에만 진행해 주세요.
        </p>
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 14,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={completeAck}
            onChange={(e) => setCompleteAck(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--color-primary-500)' }}
          />
          <span>완료 후에는 되돌릴 수 없음을 이해했습니다.</span>
        </label>
      </Modal>

      {loadingList ? (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ flex: '0 0 280px', height: 360, borderRadius: 12 }} />
          <div className="skeleton" style={{ flex: '1 1 320px', minHeight: 360, borderRadius: 12 }} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'stretch',
          }}
        >
          <aside
            style={{
              flex: '0 1 300px',
              minWidth: 240,
              maxHeight: 520,
              overflowY: 'auto',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-neutral-50)',
              padding: 8,
            }}
          >
            {rows.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--color-neutral-500)',
                  fontSize: 14,
                }}
              >
                아직 피드백 요청이 없습니다.
              </div>
            ) : (
              rows.map((r) => {
                const active = Number(selected?.id) === Number(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => void pick(r)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      marginBottom: 6,
                      borderRadius: 'var(--radius-md)',
                      border: active ? '1px solid var(--color-primary-200)' : '1px solid transparent',
                      background: active ? 'var(--color-neutral-0)' : 'transparent',
                      boxShadow: active ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      transition: 'background 150ms, border-color 150ms',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <strong style={{ fontSize: 14, color: 'var(--color-neutral-900)', lineHeight: 1.35 }}>
                        {r.title}
                      </strong>
                      {statusBadge(r.status)}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                      {r.student_name ?? `학생 #${r.student_id}`} · {formatDate(r.created_at)}
                      {(r.student_attachments?.length ?? 0) > 0 ? ' · 첨부 있음' : ''}
                    </span>
                  </button>
                );
              })
            )}
          </aside>

          <section style={{ flex: '1 1 360px', minWidth: 0 }}>
            {!selected ? (
              <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 15 }}>
                왼쪽 목록에서 요청을 선택하세요.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <MessageCircle size={22} style={{ color: 'var(--color-primary-500)' }} />
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, flex: 1, minWidth: 0 }}>{selected.title}</h2>
                  {statusBadge(selected.status)}
                </div>

                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-neutral-200)',
                    background: 'var(--color-neutral-50)',
                    marginBottom: 18,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 8 }}>
                    학생 질문
                  </div>
                  <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)', whiteSpace: 'pre-wrap' }}>
                    {selected.student_question}
                  </p>
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: '1px dashed var(--color-neutral-200)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 8 }}>
                      학생 첨부 파일
                    </div>
                    {(selected.student_attachments?.length ?? 0) > 0 ? (
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyle: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        {selected.student_attachments!.map((a) => (
                          <li key={a.url}>
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--color-primary-700)',
                                textDecoration: 'none',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-primary-200)',
                                background: 'var(--color-neutral-0)',
                              }}
                            >
                              <FileText size={16} />
                              {a.filename || '첨부 파일'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-500)', lineHeight: 1.55 }}>
                        첨부가 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: 18,
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-neutral-200)',
                    background: 'var(--color-neutral-0)',
                  }}
                >
                  <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>문답</h3>
                  {thread.length === 0 ? (
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-neutral-500)' }}>
                      아직 스레드 메시지가 없습니다. 아래에서 학생에게 답장할 수 있습니다.
                    </p>
                  ) : (
                    <div style={{ marginBottom: 14 }}>
                      {thread.map((m, i) => (
                        <ThreadBubble key={`${m.at}-${i}`} m={m} />
                      ))}
                    </div>
                  )}
                  {!isClosed ? (
                    <>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        답장
                      </label>
                      <textarea
                        className="ui-textarea"
                        rows={3}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="학생에게 보낼 메시지"
                      />
                      <div style={{ marginTop: 8 }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={sendingReply}
                          disabled={sendingReply || !replyBody.trim()}
                          onClick={() => void sendThreadReply()}
                          style={{ display: 'inline-flex', gap: 6 }}
                        >
                          <Send size={16} />
                          답장 보내기
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-500)' }}>
                      완료된 건에는 더 이상 답장할 수 없습니다.
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {!isClosed ? (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
                      상태
                      <select
                        className="ui-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress')}
                      >
                        {STATUS_OPTIONS_EDIT.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-600)' }}>
                      상태: <strong>완료</strong> (변경 불가)
                    </p>
                  )}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
                    강사 질의 (선택, 정리용)
                    <textarea
                      className="ui-textarea"
                      rows={3}
                      disabled={isClosed}
                      value={teacherQuestion}
                      onChange={(e) => setTeacherQuestion(e.target.value)}
                      placeholder="학생에게 확인할 추가 질문"
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
                    최종 피드백
                    <textarea
                      className="ui-textarea"
                      rows={6}
                      disabled={isClosed}
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      placeholder="완료 시 반드시 입력됩니다. 요약·총평 등"
                    />
                  </label>
                  {!isClosed ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                      <Button size="md" loading={saving} disabled={saving} onClick={() => void save()}>
                        저장
                      </Button>
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={() => {
                          setCompleteAck(false);
                          setCompleteOpen(true);
                        }}
                      >
                        피드백 완료 처리…
                      </Button>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)' }}>
                      이 요청은 완료되어 수정할 수 없습니다.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </TeacherWorkspace>
  );
}
