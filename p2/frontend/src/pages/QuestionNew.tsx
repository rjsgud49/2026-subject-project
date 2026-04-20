import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { createQuestionThunk, fetchQuestions } from '../features/qaSlice';
import Button from '../components/Button';

export default function QuestionNew() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    const r = await dispatch(
      createQuestionThunk({
        courseId: Number(courseId),
        title: title.trim(),
        body: body.trim(),
        is_private: isPrivate,
      }) as any
    );
    setLoading(false);
    if (r.error) {
      window.alert(r.error.message);
      return;
    }
    dispatch(fetchQuestions(Number(courseId)) as any);
    nav(`/courses/${courseId}`);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <p>
        <Link to={`/courses/${courseId}`}>← 강의로</Link>
      </p>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>질문하기</h1>
      <form onSubmit={submit} style={{ marginTop: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            marginBottom: 20,
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
            marginBottom: 16,
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer' }}>
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          비공개 질문
        </label>
        <Button type="submit" disabled={loading}>
          등록
        </Button>
      </form>
    </div>
  );
}

