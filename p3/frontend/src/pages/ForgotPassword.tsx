import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      setMsg(res?.message ?? '안내 메일을 확인해 주세요.');
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>비밀번호 찾기</h1>
      <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 24, lineHeight: 1.6 }}>
        가입한 이메일을 입력하면 재설정 링크를 보내 드립니다.
      </p>
      <form onSubmit={(e) => void submit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          이메일
          <input className="ui-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginTop: 6 }} />
        </label>
        {err && <p style={{ margin: 0, color: 'var(--color-error-600)', fontSize: 14 }}>{err}</p>}
        {msg && <p style={{ margin: 0, color: 'var(--color-success-700)', fontSize: 14, lineHeight: 1.6 }}>{msg}</p>}
        <Button type="submit" disabled={loading} size="lg">{loading ? '전송 중…' : '재설정 링크 받기'}</Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
        <Link to="/login">← 로그인으로</Link>
      </p>
    </div>
  );
}
