import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import CurriculumEditor, {
  defaultCurriculum,
  parseCurriculum,
  type CurriculumData,
} from '../../components/CurriculumEditor';
import { api } from '../../lib/api';

export default function TeacherCourseForm() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId && courseId !== 'new');
  const id = isEdit && courseId ? parseInt(courseId, 10) : NaN;
  const nav = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [curriculum, setCurriculum] = useState<CurriculumData>(() => defaultCurriculum());
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [thumbBusy, setThumbBusy] = useState(false);
  const [thumbErr, setThumbErr] = useState('');

  useEffect(() => {
    if (!isEdit) {
      setInitialLoading(false);
      return;
    }
    if (!Number.isFinite(id)) {
      setErr('올바르지 않은 강의 주소입니다.');
      setInitialLoading(false);
      return;
    }
    let ok = true;
    setInitialLoading(true);
    setErr('');
    api.teacher
      .courses()
      .then((list) => {
        const c = list.find((x) => Number(x.id) === Number(id));
        if (!ok) return;
        if (!c) {
          setErr('해당 강의를 찾을 수 없거나, 본인의 강의가 아닙니다.');
          return;
        }
        setTitle(c.title);
        setDescription(c.description ?? '');
        setPrice(typeof c.price === 'number' ? c.price : Number(c.price) || 0);
        setIsPublished(!!c.is_published);
        setThumbnailUrl(c.thumbnail_url ?? '');
        setCurriculum(parseCurriculum(c.curriculum ?? null));
      })
      .catch((e: Error) => {
        if (ok) setErr(e.message);
      })
      .finally(() => {
        if (ok) setInitialLoading(false);
      });
    return () => {
      ok = false;
    };
  }, [isEdit, id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const payloadCurriculum = curriculum as unknown as Record<string, unknown>;
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        price: Number(price),
        isPublished,
        curriculum: payloadCurriculum,
        thumbnail_url: thumbnailUrl.trim() || undefined,
      };
      if (!Number.isFinite(payload.price) || payload.price < 0) {
        setErr('가격은 0 이상의 숫자로 입력해 주세요.');
        setLoading(false);
        return;
      }
      if (isEdit) {
        await api.teacher.updateCourse(id, payload);
      } else {
        await api.teacher.createCourse(payload);
      }
      nav('/teacher/courses');
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '저장 실패');
    } finally {
      setLoading(false);
    }
  }

  const uploadVideoForCurriculum = useCallback(
    async (file: File) => {
      if (isEdit && Number.isFinite(id)) {
        return api.teacher.uploadCourseFile(id, file);
      }
      return api.teacher.uploadVideo(file);
    },
    [isEdit, id],
  );

  async function onThumbnailFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    setThumbErr('');
    setThumbBusy(true);
    try {
      const r = await api.teacher.uploadImage(file);
      setThumbnailUrl(r.url);
    } catch (ex: unknown) {
      setThumbErr(ex instanceof Error ? ex.message : '썸네일 업로드 실패');
    } finally {
      setThumbBusy(false);
    }
  }

  const titleText = isEdit ? '강의 수정' : '새 강의';

  return (
    <TeacherWorkspace
      title={titleText}
      subtitle="커리큘럼에서 영상 파일을 선택하면 업로드되고 재생 길이가 자동으로 반영됩니다. 썸네일은 이미지 파일로 올려 주세요."
      actions={
        <Button variant="ghost" size="sm" style={{ display: 'inline-flex', gap: 6 }} onClick={() => nav('/teacher/courses')}>
          <ArrowLeft size={16} />
          목록
        </Button>
      }
    >
      {initialLoading ? (
        <div className="skeleton" style={{ height: 320, borderRadius: 12 }} />
      ) : isEdit && !title && err ? (
        <p style={{ margin: 0, color: 'var(--color-error-600)', fontSize: 15 }}>{err}</p>
      ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            제목
            <input
              className="ui-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            소개
            <textarea
              className="ui-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="강의 목표, 대상 수강생 등"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            가격 (원)
            <input
              className="ui-input"
              type="number"
              min={0}
              step={1}
              value={Number.isNaN(price) ? '' : price}
              onChange={(e) => {
                const v = e.target.value;
                setPrice(v === '' ? 0 : Number(v));
              }}
              required
            />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Upload size={16} />
              썸네일 이미지 (선택)
            </span>
            <input
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
              disabled={thumbBusy}
              style={{ fontSize: 14 }}
              onChange={(e) => void onThumbnailFile(e)}
            />
            {thumbnailUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <img
                  src={thumbnailUrl}
                  alt=""
                  style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-neutral-200)' }}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setThumbnailUrl('')}>
                  썸네일 제거
                </Button>
              </div>
            ) : null}
            {thumbErr ? (
              <div role="alert" style={{ fontSize: 13, color: 'var(--color-error-600)' }}>
                {thumbErr}
              </div>
            ) : null}
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>커리큘럼</div>
            <CurriculumEditor value={curriculum} onChange={setCurriculum} uploadVideo={uploadVideoForCurriculum} />
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--color-primary-500)' }}
            />
            학생에게 공개 (강의 목록에 노출)
          </label>
          {err && (title || !isEdit) && (
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
          <div>
            <Button type="submit" size="md" loading={loading} disabled={loading} style={{ display: 'inline-flex', gap: 8 }}>
              <Save size={18} />
              저장
            </Button>
          </div>
        </form>
      )}
    </TeacherWorkspace>
  );
}
