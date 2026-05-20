import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Image as ImageIcon, UserCircle } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { useAppDispatch } from '../../hooks/useRedux';
import { setUser } from '../../features/userSlice';
import { api } from '../../lib/api';

export default function TeacherProfile() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [profileHtml, setProfileHtml] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['link', 'blockquote', 'code-block'],
        ['clean'],
      ],
    }),
    [],
  );

  useEffect(() => {
    let alive = true;
    api.auth
      .me()
      .then((u) => {
        if (!alive) return;
        setName(u.name);
        setProfileHtml(u.profile_html ?? '');
        setBannerUrl(u.banner_url ?? null);
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
      await api.teacher.updateProfile({
        name,
        profile_html: profileHtml,
        banner_url: bannerUrl?.trim() || '',
      });
      const me = await api.auth.me();
      dispatch(setUser(me));
      setOk('저장되었습니다.');
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '실패');
    } finally {
      setLoading(false);
    }
  }

  async function onBannerFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    setErr('');
    setBannerBusy(true);
    try {
      const r = await api.teacher.uploadProfileBanner(file);
      setBannerUrl(r.banner_url);
      const me = await api.auth.me();
      dispatch(setUser(me));
      setOk('배너 이미지가 적용되었습니다.');
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '배너 업로드 실패');
    } finally {
      setBannerBusy(false);
    }
  }

  return (
    <TeacherWorkspace
      title="프로필"
      subtitle="리치 텍스트로 소개를 꾸미고, 상단 배너 이미지를 올릴 수 있습니다. 저장한 내용은 강의 상세·강사 페이지 등에 반영될 수 있습니다."
    >
      {initialLoading ? (
        <div className="skeleton" style={{ maxWidth: 720, height: 320, borderRadius: 12 }} />
      ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ImageIcon size={16} />
              프로필 배너 (가로 이미지 권장)
            </span>
            <input
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
              disabled={bannerBusy}
              style={{ fontSize: 14 }}
              onChange={(e) => void onBannerFile(e)}
            />
            {bannerUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    height: 140,
                    borderRadius: 'var(--radius-lg)',
                    backgroundImage: `url(${bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--color-neutral-200)',
                  }}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setBannerUrl(null)}>
                  배너 제거 (저장 시 반영)
                </Button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-500)' }}>배너가 없으면 기본 카드 레이아웃만 표시됩니다.</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>소개 · 경력 (서식 가능)</span>
            <div className="teacher-profile-quill" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <ReactQuill theme="snow" value={profileHtml} onChange={setProfileHtml} modules={quillModules} />
            </div>
          </div>

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
