import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { setUser } from '../features/userSlice';
import Button from '../components/Button';
import { api } from '../services/api';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password2?: string;
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as any;
  const dispatch = useAppDispatch();
  const rawFrom = loc.state?.from;
  const fromPath = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 2) e.name = '이름은 2자 이상으로 입력해 주세요.';
    if (!email.trim()) {
      e.email = '이메일을 입력해 주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = '이메일 주소를 올바르게 입력해 주세요. (예: name@email.com)';
    }
    if (!password) {
      e.password = '비밀번호를 입력해 주세요.';
    } else if (password.length < 4) {
      e.password = '비밀번호는 4자 이상이어야 합니다.';
    }
    if (password !== password2) e.password2 = '비밀번호가 일치하지 않습니다.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const user = await api.auth.signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      } as any);
      dispatch(setUser(user));
      const defaultHome = role === 'teacher' ? '/teacher' : '/dashboard';
      const dest = fromPath && fromPath !== '/signup' ? fromPath : defaultHome;
      nav(dest, { replace: true });
    } catch (err: any) {
      window.alert(err?.message || '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: keyof FormErrors,
    label: string,
    type: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    autoComplete?: string,
  ) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
        {label} <span style={{ color: 'var(--color-error-500)' }}>*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setErrors((p) => ({ ...p, [id]: undefined }));
        }}
        className={`ui-input${errors[id] ? ' error' : ''}`}
        placeholder={placeholder}
        autoComplete={autoComplete ?? 'off'}
      />
      {errors[id] && (
        <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error-600)' }}>
          {errors[id]}
        </p>
      )}
    </div>
  );

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
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div
          style={{
            background: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: 'var(--shadow-lg)',
            padding: '40px 36px',
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--color-primary-500)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              P1
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>
              회원가입
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: 0 }}>
              새로운 계정을 만들고 학습을 시작하세요.
            </p>
          </div>

          <form onSubmit={submit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {field('name', '이름', 'text', name, setName, '홍길동')}
            {field('email', '이메일', 'email', email, setEmail, 'name@email.com')}
            {field('password', '비밀번호', 'password', password, setPassword, '4자 이상', 'new-password')}
            {field('password2', '비밀번호 확인', 'password', password2, setPassword2, '비밀번호 재입력')}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
                회원 유형 <span style={{ color: 'var(--color-error-500)' }}>*</span>
              </label>
              <select
                className="ui-input"
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                style={{ height: 44 }}
              >
                <option value="student">학생</option>
                <option value="teacher">강사</option>
              </select>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-neutral-500)' }}>
                가입 후 역할에 맞는 대시보드로 이동합니다.
              </p>
            </div>

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              계정 만들기
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 20, marginBottom: 0 }}>
            이미 계정이 있나요? <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>로그인</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>← 홈으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
