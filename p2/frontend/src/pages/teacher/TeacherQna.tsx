import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, MessageSquare, RefreshCcw } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { api, type TeacherQnaBoard, type TeacherQnaCourse, type TeacherQnaQuestion } from '../../lib/api';
import { formatDate } from '../../utils/format';

function AnswerBadge({ answered }: { answered: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 11,
        fontWeight: 700,
        background: answered ? 'var(--color-success-50)' : 'var(--color-warning-50)',
        color: answered ? 'var(--color-success-800)' : 'var(--color-warning-800)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: answered ? 'var(--color-success-600)' : 'var(--color-warning-600)',
        }}
      />
      {answered ? '답변 완료' : '미답변'}
    </span>
  );
}

function QuestionCard({
  question,
  active,
  onClick,
}: {
  question: TeacherQnaQuestion;
  active: boolean;
  onClick: () => void;
}) {
  const answered = Boolean(question.teacher_answer);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        border: active ? '1px solid var(--color-primary-200)' : '1px solid var(--color-neutral-200)',
        background: active ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
        borderRadius: 14,
        padding: 14,
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <strong style={{ fontSize: 14, color: 'var(--color-neutral-900)', lineHeight: 1.45 }}>{question.title}</strong>
        <AnswerBadge answered={answered} />
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>
        {question.body.length > 120 ? `${question.body.slice(0, 120)}...` : question.body}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--color-neutral-500)' }}>
        <span>{question.user_name} · {formatDate(question.created_at)}</span>
        <span>답변 {question.answer_count}개</span>
      </div>
    </button>
  );
}

function ThreadItem({ role, body, userName, createdAt }: { role: 'teacher' | 'student'; body: string; userName: string; createdAt: string; }) {
  const isTeacher = role === 'teacher';
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: isTeacher ? 'var(--color-neutral-100)' : 'var(--color-primary-50)',
        border: `1px solid ${isTeacher ? 'var(--color-neutral-200)' : 'var(--color-primary-200)'}`,
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
        {userName} · {formatDate(createdAt)} · {isTeacher ? '강사 답변' : '학생 질문'}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--color-neutral-900)' }}>{body}</div>
    </div>
  );
}

function CourseFolder({
  course,
  active,
  onSelect,
}: {
  course: TeacherQnaCourse;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        borderRadius: 16,
        border: active ? '1px solid var(--color-primary-200)' : '1px solid var(--color-neutral-200)',
        background: active ? 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-neutral-0) 100%)' : 'var(--color-neutral-0)',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
        padding: 14,
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
          <FolderOpen size={18} style={{ color: active ? 'var(--color-primary-600)' : 'var(--color-neutral-400)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.35 }}>
              {course.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>
              {course.is_published ? '공개 강의' : '비공개 강의'} · 질문 {course.question_count}개
            </div>
          </div>
        </div>
        {active ? <ChevronDown size={16} style={{ color: 'var(--color-primary-600)' }} /> : <ChevronRight size={16} style={{ color: 'var(--color-neutral-400)' }} />}
      </div>
    </button>
  );
}

export default function TeacherQna() {
  const [board, setBoard] = useState<TeacherQnaBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    return api.teacher
      .qnaBoard()
      .then((data) => {
        setBoard(data);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const courses = board?.courses ?? [];

  useEffect(() => {
    if (!courses.length) {
      setSelectedCourseId(null);
      setSelectedQuestionId(null);
      return;
    }
    if (selectedCourseId == null || !courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  useEffect(() => {
    if (!selectedCourse) {
      setSelectedQuestionId(null);
      return;
    }
    if (selectedQuestionId == null || !selectedCourse.questions.some((question) => question.id === selectedQuestionId)) {
      setSelectedQuestionId(selectedCourse.questions[0]?.id ?? null);
    }
  }, [selectedCourse, selectedQuestionId]);

  const selectedQuestion = useMemo(
    () => selectedCourse?.questions.find((question) => question.id === selectedQuestionId) ?? null,
    [selectedCourse, selectedQuestionId],
  );

  useEffect(() => {
    setDraft(selectedQuestion?.teacher_answer?.body ?? '');
    setMsg('');
  }, [selectedQuestion?.id, selectedQuestion?.teacher_answer?.body]);

  async function saveAnswer() {
    if (!selectedQuestion) return;
    const value = draft.trim();
    if (!value) {
      setErr('답변 내용을 입력해 주세요.');
      return;
    }
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      await api.teacher.updateQnaAnswer(selectedQuestion.id, { body: value });
      setMsg('답변이 저장되었습니다. 같은 질문을 다시 열어 수정할 수 있습니다.');
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  const totalQuestions = courses.reduce((sum, course) => sum + course.question_count, 0);
  const answeredQuestions = courses.reduce(
    (sum, course) => sum + course.questions.filter((question) => Boolean(question.teacher_answer)).length,
    0,
  );

  return (
    <TeacherWorkspace
      title="QnA 세션"
      subtitle="강의별 폴더에서 질문을 열고 바로 답변을 남기거나 수정하세요. 답변은 강사 계정 기준으로 한 개만 유지됩니다."
      actions={
        <Button variant="secondary" size="sm" style={{ display: 'inline-flex', gap: 8 }} onClick={() => void load()} disabled={loading}>
          <RefreshCcw size={16} />
          새로고침
        </Button>
      }
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

      {loading ? (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ flex: '0 0 280px', minHeight: 420, borderRadius: 16 }} />
          <div className="skeleton" style={{ flex: '1 1 320px', minHeight: 420, borderRadius: 16 }} />
          <div className="skeleton" style={{ flex: '1 1 320px', minHeight: 420, borderRadius: 16 }} />
        </div>
      ) : courses.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--color-neutral-500)',
            fontSize: 15,
          }}
        >
          아직 강의가 없어 QnA 세션을 만들 수 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr) 380px', gap: 16, alignItems: 'start' }}>
          <aside
            style={{
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 18,
              background: 'var(--color-neutral-50)',
              padding: 12,
              position: 'sticky',
              top: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <FolderOpen size={18} style={{ color: 'var(--color-primary-600)' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-neutral-900)' }}>강의 폴더</div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{courses.length}개 강의</div>
              </div>
            </div>
            {courses.map((course) => (
              <CourseFolder
                key={course.id}
                course={course}
                active={course.id === selectedCourseId}
                onSelect={() => setSelectedCourseId(course.id)}
              />
            ))}
          </aside>

          <section
            style={{
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 18,
              background: 'var(--color-neutral-0)',
              padding: 16,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <MessageSquare size={18} style={{ color: 'var(--color-primary-600)' }} />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    {selectedCourse?.title ?? '강의 선택'}
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-500)' }}>
                  질문을 클릭하면 오른쪽에서 답변을 수정할 수 있습니다.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)' }}>
                  총 질문 {totalQuestions}개
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-success-50)', color: 'var(--color-success-800)' }}>
                  답변 완료 {answeredQuestions}개
                </span>
              </div>
            </div>

            {selectedCourse && selectedCourse.questions.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: 14 }}>
                이 강의에는 아직 질문이 없습니다.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedCourse?.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    active={question.id === selectedQuestionId}
                    onClick={() => setSelectedQuestionId(question.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            style={{
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 18,
              background: 'linear-gradient(180deg, var(--color-neutral-0) 0%, var(--color-primary-50) 100%)',
              padding: 16,
              minWidth: 0,
            }}
          >
            {!selectedQuestion ? (
              <div style={{ padding: '40px 12px', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: 14 }}>
                답변할 질문을 선택해 주세요.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <AnswerBadge answered={Boolean(selectedQuestion.teacher_answer)} />
                  <h3 style={{ margin: '12px 0 8px', fontSize: 18, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.45 }}>
                    {selectedQuestion.title}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                    {selectedQuestion.user_name} · {formatDate(selectedQuestion.created_at)}
                  </div>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid var(--color-neutral-200)',
                    background: 'var(--color-neutral-0)',
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)', marginBottom: 6 }}>
                    학생 질문
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--color-neutral-900)' }}>
                    {selectedQuestion.body}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: 10 }}>
                    문답 스레드
                  </div>
                  {selectedQuestion.answers.length === 0 ? (
                    <div style={{ padding: 14, borderRadius: 14, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-500)', fontSize: 13 }}>
                      아직 오간 문답이 없습니다.
                    </div>
                  ) : (
                    selectedQuestion.answers.map((answer) => (
                      <ThreadItem
                        key={answer.id}
                        role={answer.role}
                        body={answer.body}
                        userName={answer.user_name}
                        createdAt={answer.created_at}
                      />
                    ))
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-neutral-900)' }}>답변 작성 / 수정</label>
                    {selectedQuestion.teacher_answer && (
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                          마지막 저장: {formatDate(selectedQuestion.teacher_answer.updated_at)}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={8}
                    placeholder="학생에게 보낼 답변을 적어 주세요. 저장하면 기존 답변이 있으면 덮어쓰고, 없으면 새로 생성됩니다."
                    style={{
                      width: '100%',
                      resize: 'vertical',
                      borderRadius: 14,
                      border: '1px solid var(--color-neutral-200)',
                      padding: 14,
                      fontFamily: 'inherit',
                      fontSize: 14,
                      lineHeight: 1.7,
                      background: 'var(--color-neutral-0)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                      이 질문에 대해서는 강사 답변이 하나만 유지됩니다.
                    </div>
                    <Button
                      onClick={() => void saveAnswer()}
                      loading={saving}
                      disabled={saving}
                      style={{ display: 'inline-flex', gap: 8 }}
                    >
                      <RefreshCcw size={16} />
                      {selectedQuestion.teacher_answer ? '답변 수정 저장' : '답변 등록'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </TeacherWorkspace>
  );
}
