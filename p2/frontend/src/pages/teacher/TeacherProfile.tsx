import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { useAppDispatch } from '../../hooks/useRedux';
import { setUser } from '../../features/userSlice';
import { api } from '../../lib/api';

export default function TeacherProfile() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.auth
      .me()
      .then((u) => {
        if (!alive) return;
        setName(u.name);
        setBio(u.bio ?? '');
      })
      .catch((e: Error) => {
        if (alive) setErr(e.message);
      })
      .finally(() => {
        if (alive) setInitialLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setOk('');
    setLoading(true);
    try {
      await api.teacher.updateProfile({ name, bio });
      const me = await api.auth.me();
      dispatch(setUser(me));
      setOk('저장되었습니다.');
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <TeacherWorkspace
      title="프로필"
      subtitle="이름과 소개는 강의 상세 등에서 수강생에게 노출될 수 있습니다."
    >
      {initialLoading ? (
        <div className="skeleton" style={{ maxWidth: 520, height: 260, borderRadius: 12 }} />
      ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-100)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCircle size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>공개 프로필</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>필수 항목은 이름입니다.</div>
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            이름
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            소개 / 경력
            <textarea
              className="ui-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              placeholder="경력, 전문 분야 등"
            />
          </label>
          {err && (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-error-50)',
                border: '1px solid var(--color-error-100)',
                color: 'var(--color-error-700)',
                fontSize: 14,
              }}
            >
              {err}
            </div>
          )}
          {ok && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-success-50)',
                border: '1px solid var(--color-success-100)',
                color: 'var(--color-success-800)',
                fontSize: 14,
              }}
            >
              {ok}
            </div>
          )}
          <Button type="submit" size="md" loading={loading} disabled={loading}>
            저장
          </Button>
        </form>
      )}
    </TeacherWorkspace>
  );
}
