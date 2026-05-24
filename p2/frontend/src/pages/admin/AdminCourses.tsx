import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Eye, EyeOff, LayoutDashboard, Search } from 'lucide-react';
import { api, type AdminCourseRow } from '../../lib/api';
import { formatDate, formatPrice } from '../../utils/format';

function SkeletonBlock({ h }: { h: number }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: 'var(--radius-md)',
        background:
          'linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-50) 50%, var(--color-neutral-100) 75%)',
        backgroundSize: '200% 100%',
        animation: 'admin-courses-shimmer 1.2s ease-in-out infinite',
      }}
    />
  );
}

export default function AdminCourses() {
  const [rows, setRows] = useState<AdminCourseRow[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [pubFilter, setPubFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr('');
    api.admin
      .courses()
      .then((data) => {
        if (ok) setRows(data);
      })
      .catch((e: Error) => {
        if (ok) setErr(e.message);
      })
      .finally(() => {
        if (ok) setLoading(false);
      });
    return () => {
      ok = false;
    };
  }, []);

  const publishedCount = useMemo(() => rows.filter((r) => r.is_published).length, [rows]);
  const draftCount = rows.length - publishedCount;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (pubFilter === 'published' && !r.is_published) return false;
      if (pubFilter === 'draft' && r.is_published) return false;
      if (!needle) return true;
      const title = (r.title || '').toLowerCase();
      const inst = (r.instructor?.name || '').toLowerCase();
      const mail = (r.instructor?.email || '').toLowerCase();
      return title.includes(needle) || inst.includes(needle) || mail.includes(needle);
    });
  }, [rows, q, pubFilter]);

  return (
    <div className="page-pad">
      <style>{`@keyframes admin-courses-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      <div style={{ marginBottom: 22 }}>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-primary-600)',
            textDecoration: 'none',
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} />
          관리자 대시보드
        </Link>
        <h1 className="page-title">전체 강의</h1>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--color-neutral-500)', lineHeight: 1.55 }}>
          비공개 강의를 포함합니다.
        </p>
      </div>

      {err && (
        <div
          role="alert"
          style={{
            marginBottom: 18,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <SkeletonBlock h={88} />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <SkeletonBlock h={88} />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <SkeletonBlock h={88} />
            </div>
          </div>
          <SkeletonBlock h={360} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <div
              className="card"
              style={{
                flex: '1 1 160px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--color-neutral-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={22} color="var(--color-neutral-600)" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)' }}>전체</div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{rows.length}</div>
              </div>
            </div>
            <div
              className="card"
              style={{
                flex: '1 1 160px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--color-success-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Eye size={22} color="var(--color-success-700)" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)' }}>공개</div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-success-700)' }}>
                  {publishedCount}
                </div>
              </div>
            </div>
            <div
              className="card"
              style={{
                flex: '1 1 160px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--color-neutral-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EyeOff size={22} color="var(--color-neutral-500)" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-500)' }}>비공개</div>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{draftCount}</div>
              </div>
            </div>
          </div>

          <section
            className="card"
            style={{
              padding: '14px 16px',
              marginBottom: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-neutral-400)',
                  pointerEvents: 'none',
                }}
              />
              <input
                className="ui-input"
                type="search"
                placeholder="제목, 강사 이름·이메일 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="강의 검색"
                style={{ paddingLeft: 40, width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'all' as const, label: '전체' },
                  { id: 'published' as const, label: '공개만' },
                  { id: 'draft' as const, label: '비공개만' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPubFilter(opt.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${pubFilter === opt.id ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                    background: pubFilter === opt.id ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
                    color: pubFilter === opt.id ? 'var(--color-primary-800)' : 'var(--color-neutral-700)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginLeft: 'auto' }}>
              {filtered.length}건 표시
            </span>
          </section>

          <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                <LayoutDashboard size={40} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                  조건에 맞는 강의가 없습니다.
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 13 }}>검색·필터를 조정해 보세요.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ID
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                          minWidth: 200,
                        }}
                      >
                        강의
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                        }}
                      >
                        강사
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        가격
                      </th>
                      <th
                        style={{
                          textAlign: 'center',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        공개
                      </th>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        생성일
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '12px 16px',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--color-neutral-600)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        보기
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontVariantNumeric: 'tabular-nums',
                            color: 'var(--color-neutral-600)',
                          }}
                        >
                          {r.id}
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: 320 }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1.35 }}>
                            {r.title}
                          </div>
                          {r.description ? (
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 12,
                                color: 'var(--color-neutral-500)',
                                lineHeight: 1.45,
                                maxHeight: 40,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {r.description.replace(/\s+/g, ' ').trim()}
                            </div>
                          ) : null}
                        </td>
                        <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600 }}>{r.instructor?.name ?? `강사 ID ${r.instructor_id}`}</div>
                          {r.instructor?.email ? (
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--color-neutral-500)',
                                wordBreak: 'break-all',
                                marginTop: 2,
                              }}
                            >
                              {r.instructor.email}
                            </div>
                          ) : null}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatPrice(r.price)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span className={`badge ${r.is_published ? 'badge-success' : 'badge-neutral'}`}>
                            {r.is_published ? '공개' : '비공개'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: 'var(--color-neutral-600)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(r.created_at)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <Link
                            to={`/courses/${r.id}`}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: 'var(--color-primary-600)',
                              textDecoration: 'none',
                            }}
                          >
                            상세
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
