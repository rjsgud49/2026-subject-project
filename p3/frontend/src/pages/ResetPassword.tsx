import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { api } from '../services/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (password !== password2) {
      setErr('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!token) {
      setErr('유효하지 않은 링크입니다. 비밀번호 찾기를 다시 시도해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.resetPassword(token, password);
      window.alert(res?.message ?? '비밀번호가 변경되었습니다.');
      nav('/login', { replace: true });
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>새 비밀번호 설정</h1>
      <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 24 }}>새 비밀번호를 입력해 주세요.</p>
      <form onSubmit={(e) => void submit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          새 비밀번호
          <input className="ui-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} style={{ marginTop: 6 }} />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          비밀번호 확인
          <input className="ui-input" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required style={{ marginTop: 6 }} />
        </label>
        {err && <p style={{ margin: 0, color: 'var(--color-error-600)', fontSize: 14 }}>{err}</p>}
        <Button type="submit" disabled={loading || !token} size="lg">{loading ? '저장 중…' : '비밀번호 변경'}</Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        <Link to="/forgot-password">링크가 만료됐나요?</Link>
      </p>
    </div>
  );
}
