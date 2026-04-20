import { useCallback, useEffect, useState } from 'react';
import { FileText, MessageCircle } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { api, type FeedbackRow } from '../../lib/api';
import { formatDate } from '../../utils/format';

const STATUS_OPTIONS: { value: FeedbackRow['status']; label: string }[] = [
  { value: 'pending', label: '대기' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'answered', label: '답변 완료' },
];

function statusBadge(status: FeedbackRow['status']) {
  const map: Record<FeedbackRow['status'], { bg: string; fg: string }> = {
    pending: { bg: 'var(--color-warning-50)', fg: 'var(--color-warning-800)' },
    in_progress: { bg: 'var(--color-primary-50)', fg: 'var(--color-primary-700)' },
    answered: { bg: 'var(--color-success-50)', fg: 'var(--color-success-800)' },
  };
  const s = map[status];
  const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
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
      {label}
    </span>
  );
}

export default function TeacherFeedback() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [status, setStatus] = useState<FeedbackRow['status']>('in_progress');
  const [teacherQuestion, setTeacherQuestion] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setTeacherQuestion(selected.teacher_question ?? '');
    setTeacherFeedback(selected.teacher_feedback ?? '');
  }, [selected?.id, selected?.updated_at]);

  function pick(row: FeedbackRow) {
    setSelected(row);
    setMsg('');
    setErr('');
  }

  async function save() {
    if (!selected) return;
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

  return (
    <TeacherWorkspace
      title="피드백 관리"
      subtitle="학생이 남긴 질문을 확인하고, 추가 질의와 최종 피드백을 작성한 뒤 상태를 갱신하세요."
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
                    onClick={() => pick(r)}
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
                        이 요청에는 첨부가 없습니다. 학생이{' '}
                        <strong>학생 피드백 신청</strong> 화면에서 파일을 올린 경우에만, 여기에 다운로드 링크가 나타납니다. (이전에
                        올린 요청은 첨부 기능 추가 이전이라 비어 있을 수 있습니다.)
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
                    상태
                    <select
                      className="ui-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as FeedbackRow['status'])}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
                    강사 질의
                    <textarea
                      className="ui-textarea"
                      rows={4}
                      value={teacherQuestion}
                      onChange={(e) => setTeacherQuestion(e.target.value)}
                      placeholder="학생에게 확인할 추가 질문"
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
                    강사 피드백
                    <textarea
                      className="ui-textarea"
                      rows={8}
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      placeholder="최종 피드백 내용"
                    />
                  </label>
                  <Button size="md" loading={saving} disabled={saving} onClick={() => void save()}>
                    저장
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </TeacherWorkspace>
  );
}
