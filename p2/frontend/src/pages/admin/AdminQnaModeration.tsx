import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCcw, FolderOpen, MessageSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type AdminQnaAnswer, type AdminQnaCourse, type AdminQnaQuestion } from '../../lib/api';
import { formatDate } from '../../utils/format';

function AnswerRow({
  answer,
  onDelete,
  busy,
}: {
  answer: AdminQnaAnswer;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 12, background: 'var(--color-neutral-0)', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
            {answer.user_name} · {formatDate(answer.created_at)}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-neutral-900)' }}>
            {answer.body}
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          style={{
            border: '1px solid var(--color-error-200)',
            background: 'var(--color-error-50)',
            color: 'var(--color-error-800)',
            padding: '7px 10px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  onDelete,
  onDeleteAnswer,
  busy,
}: {
  question: AdminQnaQuestion;
  onDelete: () => void;
  onDeleteAnswer: (answerId: number) => void;
  busy: boolean;
}) {
  return (
    <div style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 16, background: 'var(--color-neutral-0)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                background: question.is_private ? 'var(--color-warning-50)' : 'var(--color-success-50)',
                color: question.is_private ? 'var(--color-warning-800)' : 'var(--color-success-800)',
              }}
            >
              {question.is_private ? '비공개 질문' : '공개 질문'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
              {question.user_name} · {formatDate(question.created_at)}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.45 }}>
            {question.title}
          </h3>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          style={{
            border: '1px solid var(--color-error-200)',
            background: 'var(--color-error-50)',
            color: 'var(--color-error-800)',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          질문 삭제
        </button>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--color-neutral-800)', marginBottom: 12 }}>
        {question.body}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <MessageSquare size={16} style={{ color: 'var(--color-primary-600)' }} />
        <strong style={{ fontSize: 13, color: 'var(--color-neutral-900)' }}>답변 {question.answer_count}개</strong>
      </div>
      {question.answers.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', padding: '8px 0' }}>답변이 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.answers.map((answer) => (
            <AnswerRow key={answer.id} answer={answer} onDelete={() => onDeleteAnswer(answer.id)} busy={busy} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminQnaModeration() {
  const [qna, setQna] = useState<AdminQnaCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    return api.admin
      .qna()
      .then((rows) => setQna(rows))
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredQna = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return qna;
    return qna.filter((course) => {
      const inCourse = course.title.toLowerCase().includes(needle) || (course.instructor_name ?? '').toLowerCase().includes(needle);
      const inQuestions = course.questions.some((question) =>
        [question.title, question.body, question.user_name, ...question.answers.map((answer) => answer.body)].join(' ').toLowerCase().includes(needle),
      );
      return inCourse || inQuestions;
    });
  }, [qna, q]);

  async function deleteQuestion(questionId: number, questionTitle: string) {
    if (!window.confirm(`질문 "${questionTitle}"을 삭제할까요?`)) return;
    setBusyKey(`question-${questionId}`);
    setErr('');
    setMsg('');
    try {
      await api.admin.removeQuestion(questionId);
      setMsg('질문을 삭제했습니다.');
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '삭제 실패');
    } finally {
      setBusyKey('');
    }
  }

  async function deleteAnswer(answerId: number) {
    if (!window.confirm('답변을 삭제할까요?')) return;
    setBusyKey(`answer-${answerId}`);
    setErr('');
    setMsg('');
    try {
      await api.admin.removeAnswer(answerId);
      setMsg('답변을 삭제했습니다.');
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '삭제 실패');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="page-pad">
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/admin"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none', marginBottom: 10 }}
        >
          <ArrowLeft size={16} />
          관리자 대시보드
        </Link>
        <h1 className="page-title">QnA검열</h1>
        <p className="muted">질문과 답변을 크게 보고 삭제 판단을 합니다.</p>
      </div>

      {err && <div className="alert error">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <section className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={18} style={{ color: 'var(--color-primary-600)' }} />
          <strong style={{ fontSize: 14 }}>관리자 전체 접근</strong>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
          질문과 답변을 개별 삭제할 수 있습니다.
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            style={{ border: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-0)', padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <RefreshCcw size={14} style={{ display: 'inline', marginRight: 6 }} />
            새로고침
          </button>
          <button
            type="button"
            onClick={() => setQ('')}
            style={{ border: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)', padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            검색 초기화
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <input
            className="ui-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="강의명, 강사명, 질문, 답변 검색"
            style={{ width: '100%' }}
            aria-label="검열 검색"
          />
        </div>
        <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
          QnA {filteredQna.reduce((sum, course) => sum + course.question_count, 0)}건
        </span>
      </section>

      {loading ? (
        <div className="skeleton" style={{ minHeight: 320, borderRadius: 16 }} />
      ) : (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MessageSquare size={18} style={{ color: 'var(--color-primary-600)' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>전체 QnA 검열</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>질문과 답변을 한 화면에서 크게 확인하고 삭제</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredQna.length === 0 ? (
              <div style={{ padding: '24px 8px', color: 'var(--color-neutral-500)', fontSize: 14, textAlign: 'center' }}>
                조건에 맞는 QnA가 없습니다.
              </div>
            ) : (
              filteredQna.map((course) => (
                <div key={course.id} style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 16, background: 'var(--color-neutral-50)', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-neutral-900)' }}>{course.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 3 }}>
                        {course.instructor_name ?? '—'} · 질문 {course.question_count}개 · {course.is_published ? '공개' : '비공개'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {course.questions.length === 0 ? (
                      <div style={{ padding: '12px 6px', fontSize: 13, color: 'var(--color-neutral-500)' }}>질문이 없습니다.</div>
                    ) : (
                      course.questions.map((question) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          busy={busyKey === `question-${question.id}`}
                          onDelete={() => void deleteQuestion(question.id, question.title)}
                          onDeleteAnswer={(answerId) => void deleteAnswer(answerId)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}