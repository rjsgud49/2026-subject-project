import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchQuestionDetail, createAnswerThunk, deleteQuestionThunk, clearCurrentQuestion } from '../features/qaSlice';
import Button from '../components/Button';
import { getUserId } from '../services/api';

export default function QuestionDetail() {
  const { questionId } = useParams();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.qa.current) as any;
  const [answerBody, setAnswerBody] = useState('');

  useEffect(() => {
    if (questionId) dispatch(fetchQuestionDetail(Number(questionId)));
    return () => {
      dispatch(clearCurrentQuestion());
    };
  }, [questionId, dispatch]);

  const q = data?.question;
  const uid = getUserId();
  const isOwner = q && Number(q.user_id) === Number(uid);

  const submitAnswer = async (e: FormEvent) => {
    e.preventDefault();
    if (!answerBody.trim()) return;
    const r = await dispatch(createAnswerThunk({ questionId: Number(questionId), body: answerBody.trim() }) as any);
    if (!r.error) {
      setAnswerBody('');
      dispatch(fetchQuestionDetail(Number(questionId)));
    }
  };

  const del = async () => {
    if (!window.confirm('삭제할까요?')) return;
    const r = await dispatch(deleteQuestionThunk(Number(questionId)) as any);
    if (!r.error) nav(`/courses/${q.course_id}`);
  };

  if (!q) {
    return <div style={{ padding: 48, textAlign: 'center' }}>불러오는 중…</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <p>
        <Link to={`/courses/${q.course_id}`}>← 강의로</Link>
      </p>
      <article
        style={{
          padding: 24,
          background: 'var(--color-surface)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>{q.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>
          {q.user_name} · {q.created_at && new Date(q.created_at).toLocaleString('ko-KR')}
        </p>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, marginTop: 16 }}>{q.body}</pre>
        {isOwner && (
          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <Link to={`/questions/${questionId}/edit`}>
              <Button variant="secondary" size="sm">
                수정
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={del}>
              삭제
            </Button>
          </div>
        )}
      </article>

      <h2 style={{ fontSize: 18, marginBottom: 16 }}>답변 ({data?.answers?.length ?? 0})</h2>
      {(data?.answers || []).map((a: any) => (
        <div
          key={a.id}
          style={{
            padding: 16,
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            {a.user_name} · {a.created_at && new Date(a.created_at).toLocaleString('ko-KR')}
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '8px 0 0' }}>{a.body}</pre>
        </div>
      ))}

      <form onSubmit={submitAnswer} style={{ marginTop: 24 }}>
        <label style={{ fontWeight: 600 }}>답변 작성</label>
        <textarea
          value={answerBody}
          onChange={(e) => setAnswerBody(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            marginTop: 8,
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
          }}
        />
        <Button type="submit" style={{ marginTop: 12 }}>
          답변 등록
        </Button>
      </form>
    </div>
  );
}

