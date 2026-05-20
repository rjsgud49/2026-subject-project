import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchQuestionDetail, updateQuestionThunk } from '../features/qaSlice';
import Button from '../components/Button';
import { getUserId } from '../services/api';

export default function QuestionEdit() {
  const { questionId } = useParams();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.qa.current) as any;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (questionId) dispatch(fetchQuestionDetail(Number(questionId)) as any);
  }, [questionId, dispatch]);

  useEffect(() => {
    if (data?.question) {
      const uid = getUserId();
      if (Number(data.question.user_id) !== Number(uid)) {
        nav(`/questions/${questionId}`);
        return;
      }
      setTitle(data.question.title || '');
      setBody(data.question.body || '');
    }
  }, [data, questionId, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await dispatch(
      updateQuestionThunk({
        questionId: Number(questionId),
        title: title.trim(),
        body: body.trim(),
      }) as any
    );
    if (!r.error) nav(`/questions/${questionId}`);
    else window.alert(r.error.message);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <p>
        <Link to={`/questions/${questionId}`}>← 질문으로</Link>
      </p>
      <h1 style={{ fontSize: 24 }}>질문 수정</h1>
      <form onSubmit={submit} style={{ marginTop: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            marginBottom: 16,
          }}
        />
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>내용</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={8}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            marginBottom: 20,
          }}
        />
        <Button type="submit">저장</Button>
      </form>
    </div>
  );
}

