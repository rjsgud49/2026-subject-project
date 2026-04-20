import { Plus, Trash2 } from 'lucide-react';
import Button from './Button';
import { formatDuration } from '../utils/format';

export type CurriculumVideo = {
  id: number;
  title: string;
  duration: number;
  video_url: string;
};
export type CurriculumSection = { title: string; videos: CurriculumVideo[] };
export type CurriculumData = { sections: CurriculumSection[] };

export function defaultCurriculum(): CurriculumData {
  return {
    sections: [
      {
        title: '1강 · 시작하기',
        videos: [{ id: 1, title: '강의 소개', duration: 300, video_url: '' }],
      },
    ],
  };
}

export function parseCurriculum(raw: unknown): CurriculumData {
  const fallback = defaultCurriculum();
  if (!raw || typeof raw !== 'object') return fallback;
  const sec = (raw as { sections?: unknown }).sections;
  if (!Array.isArray(sec) || sec.length === 0) return fallback;

  let nextId = 1;
  const sections: CurriculumSection[] = sec.map((s: unknown, si: number) => {
    const o = s as Record<string, unknown>;
    const title = typeof o?.title === 'string' ? o.title : `섹션 ${si + 1}`;
    const videosIn = Array.isArray(o?.videos) ? o.videos : [];
    const videos: CurriculumVideo[] = videosIn.map((v: unknown, vi: number) => {
      const x = v as Record<string, unknown>;
      const id = typeof x?.id === 'number' && Number.isFinite(x.id) ? x.id : nextId++;
      nextId = Math.max(nextId, id + 1);
      return {
        id,
        title: typeof x?.title === 'string' ? x.title : `영상 ${vi + 1}`,
        duration: typeof x?.duration === 'number' && Number.isFinite(x.duration) ? x.duration : 0,
        video_url: typeof x?.video_url === 'string' ? x.video_url : '',
      };
    });
    return {
      title,
      videos:
        videos.length > 0
          ? videos
          : [{ id: nextId++, title: '새 영상', duration: 0, video_url: '' }],
    };
  });
  return { sections };
}

function nextVideoId(data: CurriculumData): number {
  let m = 0;
  for (const s of data.sections) for (const v of s.videos) m = Math.max(m, v.id);
  return m + 1;
}

export default function CurriculumEditor({
  value,
  onChange,
}: {
  value: CurriculumData;
  onChange: (v: CurriculumData) => void;
}) {
  const setSections = (sections: CurriculumSection[]) => onChange({ sections });

  const addSection = () => {
    const id = nextVideoId(value);
    setSections([
      ...value.sections,
      {
        title: `${value.sections.length + 1}강 · 새 섹션`,
        videos: [{ id, title: '새 영상', duration: 0, video_url: '' }],
      },
    ]);
  };

  const removeSection = (si: number) => {
    if (value.sections.length <= 1) return;
    setSections(value.sections.filter((_, i) => i !== si));
  };

  const patchSection = (si: number, patch: Partial<CurriculumSection>) => {
    setSections(value.sections.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  };

  const addVideo = (si: number) => {
    const id = nextVideoId(value);
    const s = value.sections[si];
    if (!s) return;
    patchSection(si, { videos: [...s.videos, { id, title: '새 영상', duration: 0, video_url: '' }] });
  };

  const removeVideo = (si: number, vi: number) => {
    const s = value.sections[si];
    if (!s || s.videos.length <= 1) return;
    patchSection(si, { videos: s.videos.filter((_, i) => i !== vi) });
  };

  const patchVideo = (si: number, vi: number, patch: Partial<CurriculumVideo>) => {
    const s = value.sections[si];
    if (!s) return;
    const videos = s.videos.map((v, i) => (i === vi ? { ...v, ...patch } : v));
    patchSection(si, { videos });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-600)' }}>
        섹션(챕터)과 각 영상의 제목·재생 URL·길이를 입력하세요. 강의 수정 화면에서 영상을 업로드하면 나온 주소를 그대로 붙여 넣을 수 있습니다.
      </p>

      {value.sections.map((section, si) => (
        <div
          key={si}
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-neutral-200)',
            background: 'var(--color-neutral-50)',
            padding: '16px 16px 14px',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 700 }}>
              섹션 제목
              <input
                className="ui-input"
                value={section.title}
                onChange={(e) => patchSection(si, { title: e.target.value })}
                placeholder="예: 2강 · 심화 개념"
              />
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
              <Button type="button" variant="secondary" size="sm" onClick={() => addVideo(si)} style={{ display: 'inline-flex', gap: 6 }}>
                <Plus size={15} />
                영상 추가
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSection(si)}
                disabled={value.sections.length <= 1}
                style={{ display: 'inline-flex', gap: 6, color: 'var(--color-error-600)' }}
              >
                <Trash2 size={15} />
                섹션 삭제
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {section.videos.map((video, vi) => (
              <div
                key={`${si}-${vi}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-200)',
                  background: 'var(--color-neutral-0)',
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600 }}>
                  영상 제목
                  <input
                    className="ui-input"
                    style={{ height: 36 }}
                    value={video.title}
                    onChange={(e) => patchVideo(si, vi, { title: e.target.value })}
                  />
                </label>
                <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600 }}>
                  영상 URL (업로드 후 복사한 주소 또는 외부 링크)
                  <input
                    className="ui-input"
                    style={{ height: 36 }}
                    value={video.video_url}
                    onChange={(e) => patchVideo(si, vi, { video_url: e.target.value })}
                    placeholder="/api/v1/files/... 또는 https://..."
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600 }}>
                  길이 (분)
                  <input
                    className="ui-input"
                    style={{ height: 36 }}
                    type="number"
                    min={0}
                    value={Math.floor(video.duration / 60)}
                    onChange={(e) => {
                      const min = Number(e.target.value) || 0;
                      const sec = video.duration % 60;
                      patchVideo(si, vi, { duration: min * 60 + sec });
                    }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600 }}>
                  길이 (초)
                  <input
                    className="ui-input"
                    style={{ height: 36 }}
                    type="number"
                    min={0}
                    max={59}
                    value={video.duration % 60}
                    onChange={(e) => {
                      const sec = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                      const min = Math.floor(video.duration / 60);
                      patchVideo(si, vi, { duration: min * 60 + sec });
                    }}
                  />
                </label>
                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                    합계 재생 길이: <strong>{formatDuration(video.duration)}</strong>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(si, vi)}
                    disabled={section.videos.length <= 1}
                    style={{ color: 'var(--color-error-600)' }}
                  >
                    영상 삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <Button type="button" variant="secondary" size="sm" onClick={addSection} style={{ display: 'inline-flex', gap: 6 }}>
          <Plus size={16} />
          섹션 추가
        </Button>
      </div>
    </div>
  );
}
