import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { setUser } from '../features/userSlice';
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
  const fromPath =
    typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname;

  const validate = (): boolean => {
    const e: { email?: string; password?: string } = {};
    if (!email.trim()) {
      e.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = '이메일 주소를 올바르게 입력해 주세요. (예: name@email.com)';
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
      const defaultHome =
        user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/dashboard';
      const dest =
        fromPath && fromPath !== '/login' ? fromPath : defaultHome;
      nav(dest, { replace: true });
    } catch (err: any) {
      window.alert(err?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100dvh - var(--nav-h))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-neutral-50)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Card */}
        <div
          style={{
            background: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: 'var(--shadow-lg)',
            padding: '40px 36px',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                width: 44, height: 44,
                borderRadius: 10,
                background: 'var(--color-primary-500)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800,
                marginBottom: 16,
              }}
            >
              P1
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>
              로그인
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: 0 }}>
              계정에 로그인하고 학습을 이어가세요.
            </p>
          </div>

          <form onSubmit={submit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 이메일 */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
                이메일 <span style={{ color: 'var(--color-error-500)' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                className={`ui-input${errors.email ? ' error' : ''}`}
                placeholder="name@email.com"
                autoComplete="off"
              />
              {errors.email && (
                <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error-600)' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
                비밀번호 <span style={{ color: 'var(--color-error-500)' }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                className={`ui-input${errors.password ? ' error' : ''}`}
                placeholder="비밀번호 입력"
                autoComplete="off"
              />
              {errors.password && (
                <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error-600)' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              로그인
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 20, marginBottom: 0 }}>
            계정이 없나요?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
              회원가입
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
            ← 홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
