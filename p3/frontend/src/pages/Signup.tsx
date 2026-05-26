import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { setUser } from '../features/userSlice';
import Button from '../components/Button';
import { api } from '../services/api';
import { JOB_FIELDS } from '../utils/constants';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password2?: string;
  phone?: string;
  teacher_expertise?: string;
  bio?: string;
  settlement_bank?: string;
  settlement_account_no?: string;
  settlement_holder?: string;
  agree_terms?: string;
  agree_privacy?: string;
  agree_settlement?: string;
}

const EXPERTISE_OPTIONS = JOB_FIELDS.flatMap((g) => g.items);

function teacherPasswordOk(pwd: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pwd);
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [step, setStep] = useState(0);

  const [phone, setPhone] = useState('');
  const [teacherExpertise, setTeacherExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [settlementBank, setSettlementBank] = useState('');
  const [settlementAccount, setSettlementAccount] = useState('');
  const [settlementHolder, setSettlementHolder] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeSettlement, setAgreeSettlement] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string | { pathname?: string } } };
  const dispatch = useAppDispatch();
  const rawFrom = loc.state?.from;
  const fromPath = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname;

  const teacherSteps = ['유형 선택', '계정 정보', '강사 프로필', '정산·약관'];
  const studentSteps = ['유형 선택', '계정 정보'];
  const steps = role === 'teacher' ? teacherSteps : studentSteps;
  const maxStep = steps.length - 1;

  const bioLen = bio.trim().length;

  const validateStep = (s: number): boolean => {
    const e: FormErrors = {};

    if (s === 0) {
      /* role only */
    } else if (s === 1) {
      if (!name.trim() || name.trim().length < 2) e.name = '이름은 2자 이상으로 입력해 주세요.';
      if (!email.trim()) {
        e.email = '이메일을 입력해 주세요.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        e.email = '이메일 주소를 올바르게 입력해 주세요.';
      }
      if (!password) {
        e.password = '비밀번호를 입력해 주세요.';
      } else if (role === 'teacher') {
        if (!teacherPasswordOk(password)) {
          e.password = '8자 이상, 영문·숫자를 각각 1자 이상 포함해야 합니다.';
        }
      } else if (password.length < 4) {
        e.password = '비밀번호는 4자 이상이어야 합니다.';
      }
      if (password !== password2) e.password2 = '비밀번호가 일치하지 않습니다.';
    } else if (role === 'teacher' && s === 2) {
      const ph = phone.replace(/\s/g, '');
      if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(ph)) {
        e.phone = '휴대폰 번호를 올바르게 입력해 주세요. (예: 010-1234-5678)';
      }
      if (!teacherExpertise) e.teacher_expertise = '주요 강의 분야를 선택해 주세요.';
      if (bio.trim().length < 30) e.bio = '강사 소개는 30자 이상 작성해 주세요.';
    } else if (role === 'teacher' && s === 3) {
      if (!settlementBank.trim()) e.settlement_bank = '은행명을 입력해 주세요.';
      if (!settlementAccount.trim()) e.settlement_account_no = '계좌번호를 입력해 주세요.';
      else if (!/^[0-9-]{8,24}$/.test(settlementAccount.trim())) {
        e.settlement_account_no = '계좌번호는 숫자와 하이픈만 사용할 수 있습니다.';
      }
      if (!settlementHolder.trim()) e.settlement_holder = '예금주명을 입력해 주세요.';
      if (!agreeTerms) e.agree_terms = '필수 동의 항목입니다.';
      if (!agreePrivacy) e.agree_privacy = '필수 동의 항목입니다.';
      if (!agreeSettlement) e.agree_settlement = '필수 동의 항목입니다.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(maxStep, prev + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((prev) => Math.max(0, prev - 1));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < maxStep) {
      goNext();
      return;
    }
    if (!validateStep(step)) return;

    try {
      setLoading(true);
      const body =
        role === 'teacher'
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
              role: 'teacher' as const,
              phone: phone.replace(/\s/g, ''),
              teacher_expertise: teacherExpertise,
              bio: bio.trim(),
              settlement_bank: settlementBank.trim(),
              settlement_account_no: settlementAccount.trim(),
              settlement_holder: settlementHolder.trim(),
              agree_terms: true,
              agree_privacy: true,
              agree_settlement: true,
            }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
              role: 'student' as const,
            };

      const user = await api.auth.signup(body);
      dispatch(setUser(user));
      const defaultHome = role === 'teacher' ? '/teacher' : '/dashboard';
      const dest = fromPath && fromPath !== '/signup' ? fromPath : defaultHome;
      nav(dest, { replace: true });
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
        onChange={(ev) => {
          onChange(ev.target.value);
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

  const stepIndicator = useMemo(
    () => (
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {steps.map((label, i) => (
          <span
            key={label}
            style={{
              fontSize: 12,
              fontWeight: i === step ? 700 : 500,
              color: i <= step ? 'var(--color-primary-600)' : 'var(--color-neutral-400)',
              padding: '4px 10px',
              borderRadius: 999,
              background: i === step ? 'var(--color-primary-50)' : 'var(--color-neutral-100)',
            }}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
    ),
    [steps, step],
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
      <div style={{ width: '100%', maxWidth: role === 'teacher' ? 520 : 420 }}>
        <div
          style={{
            background: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: 'var(--shadow-lg)',
            padding: '36px 32px',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>
              회원가입
            </h1>
          </div>

          {stepIndicator}

          <form onSubmit={submit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 0 && (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(
                    [
                      { id: 'student' as const, title: '학생', desc: '강의 수강' },
                      { id: 'teacher' as const, title: '강사', desc: '강의 개설·정산' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setRole(opt.id);
                        setStep(0);
                        setErrors({});
                      }}
                      style={{
                        padding: '16px 14px',
                        borderRadius: 12,
                        border: `2px solid ${role === opt.id ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                        background: role === opt.id ? 'var(--color-primary-50)' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{opt.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                {field('name', '이름', 'text', name, setName, '홍길동')}
                {field('email', '이메일', 'email', email, setEmail, 'name@email.com')}
                {field(
                  'password',
                  '비밀번호',
                  'password',
                  password,
                  setPassword,
                  role === 'teacher' ? '8자 이상, 영문+숫자' : '4자 이상',
                  'new-password',
                )}
                {role === 'teacher' && password && (
                  <p style={{ margin: '-8px 0 0', fontSize: 12, color: teacherPasswordOk(password) ? 'var(--color-success-600)' : 'var(--color-neutral-500)' }}>
                    {teacherPasswordOk(password) ? '✓ 비밀번호 규칙을 충족합니다.' : '영문·숫자 포함 8자 이상'}
                  </p>
                )}
                {field('password2', '비밀번호 확인', 'password', password2, setPassword2, '비밀번호 재입력')}
              </>
            )}

            {role === 'teacher' && step === 2 && (
              <>
                {field('phone', '휴대폰 번호', 'tel', phone, setPhone, '010-1234-5678')}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    주요 강의 분야 <span style={{ color: 'var(--color-error-500)' }}>*</span>
                  </label>
                  <select
                    className={`ui-select${errors.teacher_expertise ? ' error' : ''}`}
                    value={teacherExpertise}
                    onChange={(ev) => {
                      setTeacherExpertise(ev.target.value);
                      setErrors((p) => ({ ...p, teacher_expertise: undefined }));
                    }}
                  >
                    <option value="">선택하세요</option>
                    {EXPERTISE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.teacher_expertise && (
                    <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error-600)' }}>
                      {errors.teacher_expertise}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    강사 소개 <span style={{ color: 'var(--color-error-500)' }}>*</span>
                  </label>
                  <textarea
                    className={`ui-textarea${errors.bio ? ' error' : ''}`}
                    rows={5}
                    value={bio}
                    onChange={(ev) => {
                      setBio(ev.target.value);
                      setErrors((p) => ({ ...p, bio: undefined }));
                    }}
                    placeholder="경력, 강의 스타일, 대상 수강생 등을 30자 이상 작성해 주세요."
                  />
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: bioLen >= 30 ? 'var(--color-success-600)' : 'var(--color-neutral-500)' }}>
                    {bioLen} / 30자 이상
                  </p>
                  {errors.bio && (
                    <p role="alert" style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-error-600)' }}>
                      {errors.bio}
                    </p>
                  )}
                </div>
              </>
            )}

            {role === 'teacher' && step === 3 && (
              <>
                <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>
                  수익 정산을 위해 계좌 정보가 필요합니다. 예금주는 본인 명의와 일치해야 합니다.
                </p>
                {field('settlement_bank', '은행명', 'text', settlementBank, setSettlementBank, '국민은행')}
                {field('settlement_account_no', '계좌번호', 'text', settlementAccount, setSettlementAccount, '숫자만 (- 허용)')}
                {field('settlement_holder', '예금주', 'text', settlementHolder, setSettlementHolder, name.trim() || '홍길동')}
                <div style={{ display: 'grid', gap: 10, padding: 14, background: 'var(--color-neutral-50)', borderRadius: 10 }}>
                  {[
                    { checked: agreeTerms, set: setAgreeTerms, key: 'agree_terms' as const, label: '[필수] 강사 이용약관 및 콘텐츠 운영 정책에 동의합니다.' },
                    { checked: agreePrivacy, set: setAgreePrivacy, key: 'agree_privacy' as const, label: '[필수] 개인정보 수집·이용(연락처·정산 정보)에 동의합니다.' },
                    { checked: agreeSettlement, set: setAgreeSettlement, key: 'agree_settlement' as const, label: '[필수] 수익 정산·세금 신고 관련 안내를 확인했습니다.' },
                  ].map(({ checked, set, key, label }) => (
                    <label key={key} style={{ display: 'flex', gap: 8, fontSize: 13, cursor: 'pointer', alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(ev) => {
                          set(ev.target.checked);
                          setErrors((p) => ({ ...p, [key]: undefined }));
                        }}
                        style={{ marginTop: 3 }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                  {(errors.agree_terms || errors.agree_privacy || errors.agree_settlement) && (
                    <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--color-error-600)' }}>
                      필수 약관에 모두 동의해 주세요.
                    </p>
                  )}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {step > 0 && (
                <Button type="button" variant="secondary" size="lg" style={{ flex: 1 }} onClick={goBack}>
                  이전
                </Button>
              )}
              <Button type="submit" size="lg" loading={loading} style={{ flex: 2 }}>
                {step < maxStep ? '다음' : '가입 완료'}
              </Button>
            </div>
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
