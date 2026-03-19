import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { loadPlayer, setCurrentVideo, setPlaybackRate, saveVideoProgressThunk, resetPlayer } from '../features/playerSlice';
import VideoPlayer from '../components/VideoPlayer';
import { formatDuration } from '../utils/format';
import Tabs from '../components/Tabs';
import Button from '../components/Button';
import { fetchQuestions } from '../features/qaSlice';

export default function VideoPlayerPage() {
  const { enrollmentId } = useParams();
  const dispatch = useAppDispatch();
  const { enrollment, currentVideo, progress, playbackRate, status } = useAppSelector((s) => s.player) as any;
  const [bottomTab, setBottomTab] = useState('outline');
  const qa = useAppSelector((s) => s.qa.byCourse[Number(enrollment?.course?.id)]) as any;
  const saveRef = useRef<any>(null);

  useEffect(() => {
    if (enrollmentId) dispatch(loadPlayer(enrollmentId) as any);
    return () => {
      dispatch(resetPlayer());
    };
  }, [enrollmentId, dispatch]);

  useEffect(() => {
    const cid = enrollment?.course?.id;
    if (cid) dispatch(fetchQuestions(Number(cid)) as any);
  }, [enrollment?.course?.id, dispatch]);

  const progressMap = Object.fromEntries((progress || []).map((p: any) => [p.video_id, p]));

  const allVideos = useMemo(() => {
    const rows: any[] = [];
    for (const s of enrollment?.course?.sections ?? []) {
      for (const v of s.videos || []) {
        rows.push({ video: v, sectionTitle: s.title });
      }
    }
    return rows;
  }, [enrollment?.course?.sections]);

  const onTimeUpdate = (currentTime: number, duration: number) => {
    if (!currentVideo?.id || !enrollmentId) return;
    const completed = duration > 0 && currentTime >= duration * 0.9;
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      dispatch(
        saveVideoProgressThunk({
          enrollmentId,
          videoId: currentVideo.id,
          lastSecond: Math.floor(currentTime),
          completed,
        }) as any
      );
    }, 500);
  };

  const startSec = currentVideo?.id ? progressMap[currentVideo.id]?.last_second ?? 0 : 0;

  if (status === 'loading' || !enrollment) {
    return <div style={{ padding: 48, textAlign: 'center' }}>불러오는 중…</div>;
  }

  const courseId = enrollment?.course?.id;
  const bottomTabs = [
    { id: 'outline', label: '목차' },
    { id: 'qa', label: 'Q&A' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <p>
        <Link to="/dashboard">← 내 강의실</Link>
      </p>
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>{enrollment.course?.title}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        <div>
          <VideoPlayer
            key={currentVideo?.id || 'x'}
            src={currentVideo?.video_url}
            playbackRate={playbackRate}
            onPlaybackRateChange={(r: number) => dispatch(setPlaybackRate(r))}
            onTimeUpdate={onTimeUpdate}
            startSeconds={startSec}
          />
          {currentVideo && (
            <p style={{ marginTop: 16, fontWeight: 600 }}>
              {currentVideo.sectionTitle} · {currentVideo.title}
            </p>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>목차</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allVideos.map(({ video, sectionTitle }) => (
              <li key={video.id} style={{ marginBottom: 4 }}>
                <button
                  type="button"
                  onClick={() => dispatch(setCurrentVideo({ ...video, sectionTitle }) as any)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    border: currentVideo?.id === video.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    borderRadius: 8,
                    background: currentVideo?.id === video.id ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  {progressMap[video.id]?.completed && '✓ '}
                  {sectionTitle} · {video.title}{' '}
                  <span style={{ color: 'var(--color-muted)' }}>({formatDuration(video.duration_seconds)})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 36, paddingTop: 8 }}>
        <Tabs tabs={bottomTabs} active={bottomTab} onChange={setBottomTab as any} />

        {bottomTab === 'outline' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {(enrollment?.course?.sections ?? []).map((s: any) => (
              <div
                key={s.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                }}
              >
                <h3 style={{ fontSize: 15, marginBottom: 10 }}>{s.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {(s.videos ?? []).map((v: any) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => dispatch(setCurrentVideo({ ...v, sectionTitle: s.title }) as any)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: currentVideo?.id === v.id ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                          background: currentVideo?.id === v.id ? 'var(--color-brand-soft)' : '#fff',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        {progressMap[v.id]?.completed && '✓ '}
                        {v.title}{' '}
                        <span style={{ color: 'var(--color-muted)' }}>({formatDuration(v.duration_seconds)})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {bottomTab === 'qa' && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 4 }}>Q&A</h2>
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 14 }}>
                  강의 내용에 대한 질문을 남기고 답변을 확인하세요.
                </p>
              </div>
              {courseId && (
                <Link to={`/courses/${courseId}/questions/new`} style={{ textDecoration: 'none' }}>
                  <Button size="sm">질문하기</Button>
                </Link>
              )}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {(qa?.items || []).slice(0, 10).map((q: any) => (
                <li
                  key={q.id}
                  style={{
                    padding: 14,
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    background: '#fff',
                  }}
                >
                  <Link to={`/questions/${q.id}`} style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {q.title}
                  </Link>
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--color-muted)' }}>
                    {q.user_name} · 답변 {q.answer_count}
                  </div>
                </li>
              ))}
            </ul>
            {!qa?.items?.length && <p style={{ color: 'var(--color-muted)', margin: 0 }}>아직 질문이 없습니다.</p>}
            {qa?.items?.length > 10 && courseId && (
              <div style={{ marginTop: 16 }}>
                <Link to={`/courses/${courseId}`} style={{ color: 'var(--color-brand-dark)', fontWeight: 600 }}>
                  강의 상세에서 전체 Q&A 보기 →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

