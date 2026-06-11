import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutList,
  Activity,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';
import { api, type AdminCourseRow, type AdminStats, type AuthUser } from '../../lib/api';
import { formatDate, formatPrice } from '../../utils/format';

type UserRow = AuthUser & { createdAt?: string };

function RoleBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{label}</span>
        <span style={{ color: 'var(--color-neutral-500)' }}>
          {count}명 ({pct}%)
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'var(--color-neutral-100)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
            transition: 'width 0.35s ease',
          }}
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  border,
  bg,
  fg,
  Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  border: string;
  bg: string;
  fg: string;
  Icon: typeof Users;
}) {
  return (
    <div
      style={{
        flex: '1 1 160px',
        minWidth: 150,
        padding: '18px 20px',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${border}`,
        background: bg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon size={18} style={{ color: fg, opacity: 0.9 }} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-neutral-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: fg }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 6, lineHeight: 1.45 }}>{hint}</div>
    </div>
  );
}

function SkeletonBlock({ h }: { h: number }) {
  return (
    <div
      style={{
        height: h,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-50) 50%, var(--color-neutral-100) 75%)',
        backgroundSize: '200% 100%',
        animation: 'admin-dash-shimmer 1.2s ease-in-out infinite',
      }}
    />
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [courses, setCourses] = useState<AdminCourseRow[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    setErr('');
    Promise.all([api.admin.stats(), api.admin.users(), api.admin.courses()])
      .then(([s, u, c]) => {
        if (!ok) return;
        setStats(s);
        setUsers(u as UserRow[]);
        setCourses(c);
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

  const recentUsers = useMemo(() => [...users].sort((a, b) => b.id - a.id).slice(0, 6), [users]);
  const recentCourses = useMemo(() => courses.slice(0, 6), [courses]);

  const roleTotal = stats
    ? stats.byRole.admin + stats.byRole.teacher + stats.byRole.student
    : 0;

  return (
    <div className="page-pad">
      <style>{`@keyframes admin-dash-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">관리자 대시보드</h1>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--color-neutral-500)', lineHeight: 1.55 }}>
          회원·강의·수강 규모를 한눈에 보고, 자주 쓰는 관리 화면으로 바로 이동할 수 있습니다.
        </p>
      </div>

      {err && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
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

      {loading || !stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px', minWidth: 150 }}>
              <SkeletonBlock h={112} />
            </div>
            <div style={{ flex: '1 1 160px', minWidth: 150 }}>
              <SkeletonBlock h={112} />
            </div>
            <div style={{ flex: '1 1 160px', minWidth: 150 }}>
              <SkeletonBlock h={112} />
            </div>
          </div>
          <SkeletonBlock h={140} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <SkeletonBlock h={220} />
            <SkeletonBlock h={220} />
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
            <KpiCard
              label="전체 회원"
              value={stats.users.toLocaleString('ko-KR')}
              hint="가입된 모든 역할 사용자"
              border="var(--color-primary-200)"
              bg="var(--color-primary-50)"
              fg="var(--color-primary-700)"
              Icon={Users}
            />
            <KpiCard
              label="등록 강의"
              value={stats.courses.toLocaleString('ko-KR')}
              hint="플랫폼에 생성된 강의 수"
              border="var(--color-success-200)"
              bg="var(--color-success-50)"
              fg="var(--color-success-700)"
              Icon={BookOpen}
            />
            <KpiCard
              label="수강 신청"
              value={stats.enrollments.toLocaleString('ko-KR')}
              hint="누적 수강(등록) 건수"
              border="var(--color-warning-200)"
              bg="var(--color-warning-50)"
              fg="var(--color-warning-800)"
              Icon={GraduationCap}
            />
          </div>

          <section
            className="card"
            style={{ padding: '20px 22px', marginBottom: 22 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px', color: 'var(--color-neutral-900)' }}>
              역할별 회원
            </h2>
            <RoleBar label="관리자" count={stats.byRole.admin} total={roleTotal} color="var(--color-neutral-700)" />
            <RoleBar label="강사" count={stats.byRole.teacher} total={roleTotal} color="var(--color-primary-600)" />
            <RoleBar label="학생" count={stats.byRole.student} total={roleTotal} color="var(--color-success-600)" />
            {roleTotal === 0 && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-500)' }}>아직 등록된 사용자가 없습니다.</p>
            )}
          </section>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14,
              marginBottom: 26,
            }}
          >
            <Link
              to="/admin/users"
              className="card"
              style={{
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--color-primary-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCog size={22} color="var(--color-primary-600)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>회원·역할</div>
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                    사용자 목록과 역할 변경
                  </div>
                </div>
              </div>
              <ArrowRight size={20} color="var(--color-neutral-400)" />
            </Link>
            <Link
              to="/admin/courses"
              className="card"
              style={{
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  <LayoutList size={22} color="var(--color-success-700)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>전체 강의</div>
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                    강의·강사·공개 여부 확인
                  </div>
                </div>
              </div>
              <ArrowRight size={20} color="var(--color-neutral-400)" />
            </Link>
            <Link
              to="/courses"
              className="card"
              style={{
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  <Shield size={22} color="var(--color-neutral-600)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>공개 강의 목록</div>
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                    학생 화면과 동일한 카탈로그
                  </div>
                </div>
              </div>
              <ArrowRight size={20} color="var(--color-neutral-400)" />
            </Link>
            <Link
              to="/admin/reviews"
              className="card"
              style={{
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--color-warning-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={22} color="var(--color-warning-700)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>리뷰 검수</div>
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                    랜딩 후기 승인·거절
                  </div>
                </div>
              </div>
              <ArrowRight size={20} color="var(--color-neutral-400)" />
            </Link>
            <Link
              to="/admin/ops"
              className="card"
              style={{
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--color-warning-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={22} color="var(--color-warning-800)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>운영 · 모니터링</div>
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                    메트릭, 감사 로그, Webhook
                  </div>
                </div>
              </div>
              <ArrowRight size={20} color="var(--color-neutral-400)" />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 18,
            }}
          >
            <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '16px 18px',
                  borderBottom: '1px solid var(--color-neutral-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>최근 가입 회원</h2>
                <Link to="/admin/users" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary-600)' }}>
                  전체 보기
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-neutral-50)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                        ID
                      </th>
                      <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                        이름
                      </th>
                      <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                        역할
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '20px 14px', color: 'var(--color-neutral-500)' }}>
                          회원 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      recentUsers.map((u) => (
                        <tr key={u.id} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                          <td style={{ padding: '10px 14px', fontVariantNumeric: 'tabular-nums' }}>{u.id}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', wordBreak: 'break-all' }}>
                              {u.email}
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className={`badge badge-${u.role === 'admin' ? 'neutral' : u.role === 'teacher' ? 'primary' : 'success'}`}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '16px 18px',
                  borderBottom: '1px solid var(--color-neutral-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>최근 등록 강의</h2>
                <Link to="/admin/courses" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary-600)' }}>
                  전체 보기
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-neutral-50)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                        강의
                      </th>
                      <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                        강사
                      </th>
                      <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: 'var(--color-neutral-600)' }}>
                        가격
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '20px 14px', color: 'var(--color-neutral-500)' }}>
                          등록된 강의가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      recentCourses.map((c) => (
                        <tr key={c.id} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                          <td style={{ padding: '10px 14px', maxWidth: 200 }}>
                            <Link
                              to={`/courses/${c.id}`}
                              style={{ fontWeight: 600, color: 'var(--color-neutral-900)', textDecoration: 'none' }}
                            >
                              {c.title}
                            </Link>
                            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span
                                className={`badge ${c.is_published ? 'badge-success' : 'badge-neutral'}`}
                                style={{ fontSize: 11 }}
                              >
                                {c.is_published ? '공개' : '비공개'}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>
                                {formatDate(c.created_at)}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            {c.instructor?.name ?? '—'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {formatPrice(c.price)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
