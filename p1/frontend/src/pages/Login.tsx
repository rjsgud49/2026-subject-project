import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { setUser } from '../features/userSlice';
import { SESSION_KEY } from '../utils/constants';
import Button from '../components/Button';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as any;
  const dispatch = useAppDispatch();
  const rawFrom = loc.state?.from;
  const from = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || '/dashboard';

  const validate = (): boolean => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) {
      e.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = '유효한 이메일 형식을 입력해 주세요.';
    }
    if (!password) e.password = '비밀번호를 입력해 주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const user = await api.auth.login({ email: email.trim(), password } as any);
      dispatch(setUser(user));
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      nav(from, { replace: true });
    } catch (err: any) {
      window.alert(err?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 15,
    boxSizing: 'border-box',
    display: 'block',
  };

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, var(--color-brand-soft) 0%, var(--color-bg) 50%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '40px 36px',
          background: 'var(--color-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--color-brand)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          P1
        </div>
        <h1 style={{ fontSize: 24, marginBottom: 8, fontWeight: 800 }}>시작하기</h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          간이 로그인 후 내 강의실·장바구니를 이용할 수 있습니다.
          <br />
          <span style={{ fontSize: 13 }}>아이디(이메일) + 비밀번호로 로그인합니다.</span>
        </p>
        <form onSubmit={submit} style={{ width: '100%' }} autoComplete="off">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            style={{ ...fieldStyle, marginBottom: errors.email ? 4 : 16, borderColor: errors.email ? '#ef4444' : undefined }}
            autoComplete="off"
          />
          {errors.email && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{errors.email}</p>}
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
            style={{ ...fieldStyle, marginBottom: errors.password ? 4 : 28, borderColor: errors.password ? '#ef4444' : undefined }}
            autoComplete="off"
          />
          {errors.password && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 24 }}>{errors.password}</p>}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            loading={loading}
            style={{
              width: '100%',
              maxWidth: '100%',
              justifyContent: 'center',
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            시작하기
          </Button>
        </form>
        <p style={{ marginTop: 18, textAlign: 'center', fontSize: 14, color: 'var(--color-muted)' }}>
          계정이 없나요?{' '}
          <Link to="/signup" style={{ color: 'var(--color-brand-dark)', fontWeight: 700 }}>
            회원가입
          </Link>
        </p>
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
          <Link to="/" style={{ color: 'var(--color-muted)', fontWeight: 500 }}>
            ← 홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}

