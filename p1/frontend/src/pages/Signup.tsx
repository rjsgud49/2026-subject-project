import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { setUser } from '../features/userSlice';
import { SESSION_KEY } from '../utils/constants';
import Button from '../components/Button';
import { api } from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as any;
  const dispatch = useAppDispatch();
  const from = loc.state?.from?.pathname || '/dashboard';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
    };
    if (!payload.name || !payload.email || !payload.password) return;
    if (password.length < 4) {
      window.alert('비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (password !== password2) {
      window.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      const user = await api.auth.signup(payload as any);
      dispatch(setUser(user));
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      nav(from, { replace: true });
    } catch (err: any) {
      window.alert(err?.message || '회원가입에 실패했습니다.');
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
          maxWidth: 420,
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
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          +
        </div>
        <h1 style={{ fontSize: 24, marginBottom: 8, fontWeight: 800 }}>회원가입</h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          이메일로 계정을 생성합니다. (P1 간이 인증)
        </p>

        <form onSubmit={submit} style={{ width: '100%' }} autoComplete="off">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 홍길동"
            style={{ ...fieldStyle, marginBottom: 18 }}
            required
            autoComplete="off"
          />
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="예) student@p1.local"
            style={{ ...fieldStyle, marginBottom: 16 }}
            required
            autoComplete="off"
          />
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="4자 이상"
            style={{ ...fieldStyle, marginBottom: 12 }}
            required
            autoComplete="new-password"
          />
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>비밀번호 확인</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="비밀번호 재입력"
            style={{ ...fieldStyle, marginBottom: 28 }}
            required
            autoComplete="off"
          />
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
            가입하고 시작하기
          </Button>
        </form>

        <p style={{ marginTop: 18, textAlign: 'center', fontSize: 14, color: 'var(--color-muted)' }}>
          이미 계정이 있나요?{' '}
          <Link to="/login" style={{ color: 'var(--color-brand-dark)', fontWeight: 700 }}>
            로그인
          </Link>
        </p>

        <p style={{ marginTop: 18, textAlign: 'center', fontSize: 14 }}>
          <Link to="/" style={{ color: 'var(--color-muted)', fontWeight: 500 }}>
            ← 홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}

