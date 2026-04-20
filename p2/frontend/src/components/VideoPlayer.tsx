import { useRef, useEffect } from 'react';
import Button from './Button';

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export default function VideoPlayer({
  src,
  playbackRate,
  onPlaybackRateChange,
  onTimeUpdate,
  onEnded,
  startSeconds = 0,
}: {
  src?: string;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  startSeconds?: number;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate, src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !startSeconds) return;
    el.currentTime = startSeconds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const enterFs = () => {
    const el = ref.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
  };

  if (!src) {
    return (
      <div
        style={{
          aspectRatio: '16/9',
          background: '#111',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
        }}
      >
        재생할 영상이 없습니다.
      </div>
    );
  }

  return (
    <div>
      <video
        ref={ref}
        src={src}
        controls
        style={{ width: '100%', maxHeight: 520, borderRadius: 12, background: '#000' }}
        onTimeUpdate={() => {
          const el = ref.current;
          if (el && onTimeUpdate) onTimeUpdate(el.currentTime, el.duration);
        }}
        onEnded={() => onEnded?.()}
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>재생 속도</span>
        <select
          value={playbackRate}
          onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
          style={{ padding: 8, borderRadius: 8, border: '1px solid var(--color-border)' }}
        >
          {RATES.map((r) => (
            <option key={r} value={r}>
              {r}x
            </option>
          ))}
        </select>
        <Button variant="secondary" size="sm" type="button" onClick={enterFs}>
          전체 화면
        </Button>
      </div>
    </div>
  );
}

