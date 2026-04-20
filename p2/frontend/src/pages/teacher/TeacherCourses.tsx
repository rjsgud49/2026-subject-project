import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2, ImageOff } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { api, type TeacherCourse } from '../../lib/api';
import { formatPrice } from '../../utils/format';

export default function TeacherCourses() {
  const nav = useNavigate();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return api.teacher
      .courses()
      .then(setCourses)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: number) {
    if (!confirm('이 강의를 삭제할까요? 삭제 후에는 복구할 수 없습니다.')) return;
    try {
      await api.teacher.deleteCourse(id);
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '삭제 실패');
    }
  }

  return (
    <TeacherWorkspace
      title="내 강의"
      subtitle="공개 여부·가격·커리큘럼은 수정 화면에서 변경할 수 있습니다."
      actions={
        <Button size="md" style={{ display: 'inline-flex', gap: 8 }} onClick={() => nav('/teacher/courses/new')}>
          <Plus size={18} />
          새 강의
        </Button>
      }
    >
      {err && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
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

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((k) => (
            <div key={k} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="등록된 강의가 없습니다"
          description="첫 강의를 만들면 여기에 카드 형태로 표시됩니다."
          action={<Button size="md" onClick={() => nav('/teacher/courses/new')}>새 강의 만들기</Button>}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 18,
          }}
        >
          {courses.map((c) => (
            <article
              key={c.id}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-neutral-200)',
                overflow: 'hidden',
                background: 'var(--color-neutral-0)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  height: 132,
                  background: 'var(--color-neutral-100)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-neutral-400)',
                }}
              >
                {c.thumbnail_url ? (
                  <img
                    src={c.thumbnail_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageOff size={40} strokeWidth={1.2} />
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: c.is_published ? 'var(--color-success-500)' : 'var(--color-neutral-700)',
                    color: '#fff',
                  }}
                >
                  {c.is_published ? '공개' : '비공개'}
                </span>
              </div>
              <div style={{ padding: '16px 16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: 'var(--color-neutral-900)' }}>
                  {c.title}
                </h2>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--color-primary-600)' }}>
                  {formatPrice(c.price)}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-neutral-500)' }}>
                  조회 {c.view_count != null ? Number(c.view_count).toLocaleString('ko-KR') : '0'}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ flex: '0 0 auto', display: 'inline-flex', gap: 6, paddingLeft: 12, paddingRight: 12 }}
                    onClick={() => nav(`/teacher/courses/${Number(c.id)}/edit`)}
                  >
                    <Pencil size={15} />
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ display: 'inline-flex', gap: 6, flex: '0 0 auto' }}
                    onClick={() => void remove(Number(c.id))}
                  >
                    <Trash2 size={15} />
                    삭제
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </TeacherWorkspace>
  );
}
