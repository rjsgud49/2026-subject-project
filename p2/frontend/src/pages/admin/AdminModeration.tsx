import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle, BookOpen, RefreshCcw, Trash2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type AdminCourseRow, type AdminQnaAnswer, type AdminQnaCourse, type AdminQnaQuestion } from '../../lib/api';
import { formatDate, formatPrice } from '../../utils/format';

function CourseCard({
  course,
  reason,
  onReasonChange,
  onReject,
  onDelete,
  busy,
}: {
  course: AdminCourseRow;
  reason: string;
  onReasonChange: (value: string) => void;
  onReject: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [showContent, setShowContent] = useState(false);
  return (
    <div
      style={{
        border: '1px solid var(--color-neutral-200)',
        borderRadius: 16,
        background: 'var(--color-neutral-0)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.35 }}>
            {course.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>
            {course.instructor?.name ?? '—'} · {course.instructor?.email ?? ''}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: course.is_published ? 'var(--color-success-50)' : 'var(--color-neutral-100)',
            color: course.is_published ? 'var(--color-success-800)' : 'var(--color-neutral-700)',
            whiteSpace: 'nowrap',
          }}
        >
          {course.is_published ? '공개' : '비공개'}
        </span>
      </div>
      {!course.is_published && course.moderation_status !== 'rejected' ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
          }}
        >
          비공개 초안입니다. 아직 제재 대상이 아니며, 관리자 반려 사유는 저장되지 않습니다.
        </div>
      ) : null}
      {course.description && (
        <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>
          {course.description.replace(/\s+/g, ' ').trim()}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-neutral-600)' }}>
        <span>{formatPrice(course.price)}</span>
        <span>{formatDate(course.created_at)}</span>
      </div>
      <button
        type="button"
        onClick={() => setShowContent((prev) => !prev)}
        style={{
          alignSelf: 'flex-start',
          border: '1px solid var(--color-neutral-200)',
          background: 'var(--color-neutral-50)',
          color: 'var(--color-neutral-700)',
          padding: '7px 10px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {showContent ? '강의 내용 접기' : '강의 내용 보기'}
      </button>
      {showContent && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 14,
            borderRadius: 12,
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 128,
                height: 72,
                borderRadius: 10,
                background: 'var(--color-neutral-100)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-neutral-400)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '썸네일 없음'
              )}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-neutral-500)', marginBottom: 6 }}>전체 설명</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-neutral-800)', whiteSpace: 'pre-wrap' }}>
                {course.description?.trim() || '상세 설명이 없습니다.'}
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-neutral-500)', marginBottom: 8 }}>커리큘럼 및 영상</div>
            {Array.isArray(course.sections) && course.sections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {course.sections.map((section: any, sectionIndex: number) => (
                  <div key={sectionIndex} style={{ padding: 12, borderRadius: 10, background: 'var(--color-neutral-0)', border: '1px solid var(--color-neutral-200)' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: 6 }}>
                      {section?.title ?? `섹션 ${sectionIndex + 1}`}
                    </div>
                    {Array.isArray(section?.videos) && section.videos.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {section.videos.map((video: any, videoIndex: number) => (
                          <div
                            key={videoIndex}
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              background: 'var(--color-neutral-50)',
                              border: '1px solid var(--color-neutral-200)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 10,
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.5 }}>
                                {video?.title ?? `영상 ${videoIndex + 1}`}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                                {video?.duration ? `재생시간 ${video.duration}` : '재생시간 정보 없음'}
                              </div>
                            </div>
                            {video?.video_url ? (
                              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-neutral-200)', background: '#000' }}>
                                <video
                                  controls
                                  preload="metadata"
                                  src={video.video_url}
                                  style={{ width: '100%', display: 'block', maxHeight: 360 }}
                                >
                                  브라우저가 동영상 재생을 지원하지 않습니다.
                                </video>
                              </div>
                            ) : (
                              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>영상 주소가 없습니다.</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>영상이 없습니다.</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>커리큘럼이 없습니다.</div>
            )}
          </div>
        </div>
      )}
      {!course.is_published && course.rejection_reason ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-200)',
            fontSize: 13,
            lineHeight: 1.65,
            color: 'var(--color-warning-900)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>반려 사유</div>
          {course.rejection_reason}
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {course.is_published ? (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-600)' }}>반려 사유 입력</span>
              <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                rows={3}
                placeholder="예: 강의 소개 문구가 과장되어 있어 수정이 필요합니다."
                style={{
                  width: '100%',
                  resize: 'vertical',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--color-neutral-200)',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              style={{
                border: '1px solid var(--color-neutral-200)',
                background: 'var(--color-warning-50)',
                color: 'var(--color-warning-800)',
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              <EyeOff size={14} style={{ display: 'inline', marginRight: 6 }} />
              반려 후 비공개
            </button>
          </>
        ) : (
          <div style={{ width: '100%', fontSize: 12, color: 'var(--color-neutral-500)', lineHeight: 1.6 }}>
            비공개 초안입니다. 아직 제재 대상이 아니며, 공개 전환은 강사가 담당합니다.
          </div>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          style={{
            border: '1px solid var(--color-error-200)',
            background: 'var(--color-error-50)',
            color: 'var(--color-error-800)',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          <Trash2 size={14} style={{ display: 'inline', marginRight: 6 }} />
          삭제
        </button>
      </div>
    </div>
  );
}

export default function AdminModeration() {
  const [courses, setCourses] = useState<AdminCourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [q, setQ] = useState('');
  const [courseReasons, setCourseReasons] = useState<Record<number, string>>({});

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    return api.admin.courses()
      .then((courseRows) => {
        setCourses(courseRows);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCourses = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((course) => {
      const title = course.title.toLowerCase();
      const inst = course.instructor?.name?.toLowerCase() ?? '';
      const mail = course.instructor?.email?.toLowerCase() ?? '';
      return title.includes(needle) || inst.includes(needle) || mail.includes(needle);
    });
  }, [courses, q]);

  async function toggleCourse(course: AdminCourseRow) {
    setBusyKey(`course-${course.id}`);
    setErr('');
    setMsg('');
    try {
      const reason = courseReasons[course.id]?.trim() ?? '';
      await api.admin.setCoursePublished(course.id, false, reason || undefined);
      setMsg('강의를 반려하여 비공개로 전환했습니다.');
      setCourseReasons((prev) => {
        const next = { ...prev };
        delete next[course.id];
        return next;
      });
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '처리 실패');
    } finally {
      setBusyKey('');
    }
  }

  async function deleteCourse(course: AdminCourseRow) {
    if (!window.confirm(`"${course.title}" 강의를 삭제할까요? 관련 QnA와 수강 기록이 함께 제거될 수 있습니다.`)) return;
    setBusyKey(`course-${course.id}`);
    setErr('');
    setMsg('');
    try {
      await api.admin.removeCourse(course.id);
      setMsg('강의를 삭제했습니다.');
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '삭제 실패');
    } finally {
      setBusyKey('');
    }
  }

  async function rejectCourse(course: AdminCourseRow) {
    const reason = courseReasons[course.id]?.trim() ?? '';
    if (!reason) {
      setErr('반려 사유를 입력해 주세요.');
      return;
    }
    setBusyKey(`course-${course.id}`);
    setErr('');
    setMsg('');
    try {
      await api.admin.setCoursePublished(course.id, false, reason);
      setMsg('강의를 반려하여 비공개로 전환했습니다.');
      setCourseReasons((prev) => {
        const next = { ...prev };
        delete next[course.id];
        return next;
      });
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '반려 실패');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="page-pad">
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--color-primary-600)',
            textDecoration: 'none',
            marginBottom: 10,
          }}
        >
          <ArrowLeft size={16} />
          관리자 대시보드
        </Link>
        <h1 className="page-title">강의검열</h1>
        <p className="muted">강의 내용 전체를 크게 보고, 반려·삭제 판단을 합니다.</p>
      </div>

      {err && <div className="alert error">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <section className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning-700)' }} />
          <strong style={{ fontSize: 14 }}>관리자 전체 접근</strong>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
          강의 내용과 반려 사유를 크게 보고, 운영 이슈를 직접 처리할 수 있습니다.
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            style={{
              border: '1px solid var(--color-neutral-200)',
              background: 'var(--color-neutral-0)',
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCcw size={14} style={{ display: 'inline', marginRight: 6 }} />
            새로고침
          </button>
          <button
            type="button"
            onClick={() => setQ('')}
            style={{
              border: '1px solid var(--color-neutral-200)',
              background: 'var(--color-neutral-50)',
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            검색 초기화
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <input
            className="ui-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="강의명, 강사명, 질문, 답변 검색"
            style={{ width: '100%' }}
            aria-label="검열 검색"
          />
        </div>
        <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
          강의 {filteredCourses.length}개
        </span>
      </section>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <div className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />
          <div className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />
        </div>
      ) : (
        <section className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <BookOpen size={18} style={{ color: 'var(--color-primary-600)' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>전체 강의 검열</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>공개/비공개 전환 및 삭제</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredCourses.length === 0 ? (
              <div style={{ padding: '24px 8px', color: 'var(--color-neutral-500)', fontSize: 14, textAlign: 'center' }}>
                조건에 맞는 강의가 없습니다.
              </div>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  busy={busyKey === `course-${course.id}`}
                  reason={courseReasons[course.id] ?? course.rejection_reason ?? ''}
                  onReasonChange={(value) =>
                    setCourseReasons((prev) => ({
                      ...prev,
                      [course.id]: value,
                    }))
                  }
                  onReject={() => void rejectCourse(course)}
                  onDelete={() => void deleteCourse(course)}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
