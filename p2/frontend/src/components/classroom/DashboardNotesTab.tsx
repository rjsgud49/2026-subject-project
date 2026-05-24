import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type CoursePublic, type StudyNoteRow } from '../../lib/api';
import Button from '../Button';
import EmptyState from '../EmptyState';

type VideoRow = {
  id: number;
  title: string;
  sectionTitle: string;
};

function flattenVideos(course: CoursePublic | null): VideoRow[] {
  if (!course?.sections) return [];
  const rows: VideoRow[] = [];
  for (const s of course.sections as { title?: string; videos?: { id: number; title: string }[] }[]) {
    const sectionTitle = s.title ?? '섹션';
    for (const v of s.videos ?? []) {
      if (v?.id != null) rows.push({ id: Number(v.id), title: v.title ?? `영상 ${v.id}`, sectionTitle });
    }
  }
  return rows;
}

type EnrollmentItem = {
  id: number;
  course_id: number;
  course_title?: string | null;
};

function notesToMap(rows: StudyNoteRow[]): Map<number, string> {
  const m = new Map<number, string>();
  for (const n of rows) {
    if (n.text?.trim()) m.set(Number(n.video_id), n.text);
  }
  return m;
}

export default function DashboardNotesTab({ enrollments }: { enrollments: EnrollmentItem[] }) {
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [videoId, setVideoId] = useState<number | null>(null);
  const [course, setCourse] = useState<CoursePublic | null>(null);
  const [notesByVideo, setNotesByVideo] = useState<Map<number, string>>(new Map());
  const [noteCounts, setNoteCounts] = useState<Record<number, number>>({});
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState('');
  const [err, setErr] = useState('');

  const selected = enrollments.find((e) => e.id === enrollmentId) ?? null;
  const videos = useMemo(() => flattenVideos(course), [course]);

  const refreshNoteCounts = useCallback(async () => {
    if (!enrollments.length) {
      setNoteCounts({});
      return;
    }
    const counts: Record<number, number> = {};
    await Promise.all(
      enrollments.map(async (e) => {
        try {
          const rows = await api.enrollments.listNotes(e.id);
          counts[e.id] = rows.filter((n) => n.text?.trim()).length;
        } catch {
          counts[e.id] = 0;
        }
      }),
    );
    setNoteCounts(counts);
  }, [enrollments]);

  const loadNotes = useCallback(async (eid: number) => {
    setNotesLoading(true);
    setErr('');
    try {
      const rows = await api.enrollments.listNotes(eid);
      setNotesByVideo(notesToMap(rows));
    } catch (e) {
      setNotesByVideo(new Map());
      setErr(e instanceof Error ? e.message : '노트를 불러오지 못했습니다.');
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNoteCounts();
  }, [refreshNoteCounts]);

  useEffect(() => {
    if (!enrollments.length) {
      setEnrollmentId(null);
      return;
    }
    if (enrollmentId == null || !enrollments.some((e) => e.id === enrollmentId)) {
      setEnrollmentId(enrollments[0].id);
    }
  }, [enrollments, enrollmentId]);

  useEffect(() => {
    if (enrollmentId == null) return;
    loadNotes(enrollmentId);
  }, [enrollmentId, loadNotes]);

  useEffect(() => {
    if (!selected) {
      setCourse(null);
      return;
    }
    setLoading(true);
    api.courses
      .get(selected.course_id)
      .then((c) => {
        setCourse(c);
        const list = flattenVideos(c);
        setVideoId((prev) => (prev != null && list.some((v) => v.id === prev) ? prev : list[0]?.id ?? null));
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [selected?.course_id, selected?.id]);

  useEffect(() => {
    if (videoId != null) {
      setDraft(notesByVideo.get(videoId) ?? '');
    } else {
      setDraft('');
    }
    setSavedHint('');
  }, [videoId, notesByVideo]);

  const currentVideo = videos.find((v) => v.id === videoId) ?? null;

  const handleSave = async () => {
    if (enrollmentId == null || videoId == null) return;
    setSaving(true);
    setErr('');
    try {
      const saved = await api.enrollments.upsertNote(enrollmentId, videoId, draft);
      setNotesByVideo((prev) => {
        const next = new Map(prev);
        if (saved.text?.trim()) next.set(videoId, saved.text);
        else next.delete(videoId);
        return next;
      });
      setDraft(saved.text ?? '');
      setSavedHint('저장되었습니다.');
      setTimeout(() => setSavedHint(''), 2000);
      refreshNoteCounts();
    } catch (e) {
      setErr(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const hasNote = (vid: number) => Boolean(notesByVideo.get(vid)?.trim());

  if (!enrollments.length) {
    return (
      <EmptyState
        title="수강 중인 강의가 없어요"
        description="강의를 수강하면 강의별·영상별로 학습 노트를 남길 수 있습니다."
        action={
          <Link to="/courses">
            <Button>강의 둘러보기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {err && (
        <p style={{ color: 'var(--color-error-600)', fontSize: 14, marginBottom: 12 }} role="alert">
          {err}
        </p>
      )}

      <aside style={sidebarStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: 10 }}>
          수강 강의
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {enrollments.map((e) => {
            const active = e.id === enrollmentId;
            const count = noteCounts[e.id] ?? 0;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setEnrollmentId(e.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: active ? '1px solid var(--color-primary-300)' : '1px solid var(--color-neutral-200)',
                    background: active ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontWeight: active ? 600 : 500 }}>{e.course_title ?? `강의 #${e.course_id}`}</div>
                  {count > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--color-primary-600)', marginTop: 4 }}>노트 {count}개</div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 260px) 1fr', gap: 20, minHeight: 360 }}>
        <div>
          {(loading || notesLoading) && (
            <p style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>불러오는 중…</p>
          )}
          {!loading && !notesLoading && videos.length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>이 강의에 등록된 영상이 없습니다.</p>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {videos.map((v) => {
              const active = v.id === videoId;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setVideoId(v.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: active ? 'var(--color-neutral-900)' : 'transparent',
                      color: active ? '#fff' : 'var(--color-neutral-700)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: 11, opacity: 0.75, marginBottom: 2 }}>{v.sectionTitle}</span>
                    {hasNote(v.id) && <span style={{ marginRight: 4 }}>📝</span>}
                    {v.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          {currentVideo && enrollmentId != null ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>
                  {currentVideo.sectionTitle} · {currentVideo.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-500)' }}>
                  강의 내용에 맞춰 메모를 남기세요. 저장된 노트는 계정에 보관됩니다.
                </p>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="핵심 내용, 질문, 복습 포인트를 적어보세요."
                disabled={saving}
                style={{
                  width: '100%',
                  minHeight: 220,
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-200)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중…' : '저장'}
                </Button>
                {savedHint && (
                  <span style={{ fontSize: 13, color: 'var(--color-success-600)' }}>{savedHint}</span>
                )}
                <Link to={`/learn/${enrollmentId}`} style={{ fontSize: 13, color: 'var(--color-primary-600)', fontWeight: 600 }}>
                  이 영상 학습하기 →
                </Link>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>왼쪽에서 영상을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const sidebarStyle: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 24,
  borderBottom: '1px solid var(--color-neutral-200)',
};
