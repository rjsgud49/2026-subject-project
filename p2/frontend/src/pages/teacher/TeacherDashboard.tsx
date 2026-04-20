import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, Plus, Sparkles, TrendingUp, Eye, Users, Wallet } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { api, type TeacherDashboard } from '../../lib/api';
import { formatPrice } from '../../utils/format';

function formatWon(n: number) {
  return `${Number(n || 0).toLocaleString('ko-KR')}원`;
}

export default function TeacherDashboard() {
  const nav = useNavigate();
  const [dash, setDash] = useState<TeacherDashboard | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    api.teacher
      .dashboard()
      .then((data) => {
        if (ok) setDash(data);
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

  const courses = dash?.courses ?? [];
  const pub = courses.filter((c) => c.is_published).length;
  const recent = courses.slice(0, 5);
  const feePct = dash ? Math.round(dash.platform_fee_rate * 100) : 0;
  const t = dash?.totals;

  const stat = (
    label: string,
    value: string | number,
    hint: string,
    tone: 'blue' | 'green' | 'amber' | 'violet',
    Icon?: typeof TrendingUp,
  ) => {
    const styles = {
      blue: {
        border: 'var(--color-primary-200)',
        bg: 'var(--color-primary-50)',
        fg: 'var(--color-primary-700)',
      },
      green: {
        border: 'var(--color-success-200)',
        bg: 'var(--color-success-50)',
        fg: 'var(--color-success-700)',
      },
      amber: {
        border: 'var(--color-warning-200)',
        bg: 'var(--color-warning-50)',
        fg: 'var(--color-warning-800)',
      },
      violet: {
        border: '#DDD6FE',
        bg: '#F5F3FF',
        fg: '#5B21B6',
      },
    }[tone];
    return (
      <div
        style={{
          flex: '1 1 140px',
          minWidth: 130,
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${styles.border}`,
          background: styles.bg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {Icon && <Icon size={16} style={{ color: styles.fg, opacity: 0.85 }} />}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: styles.fg }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: 6, lineHeight: 1.45 }}>{hint}</div>
      </div>
    );
  };

  return (
    <TeacherWorkspace
      title="대시보드"
      subtitle={`플랫폼 수수료는 매출의 ${feePct}%로 가정해 표시합니다. (실제 정산 규칙은 운영 정책에 따릅니다)`}
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

      {loading || !dash ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="skeleton" style={{ flex: 1, minWidth: 120, minHeight: 96, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            {stat('총 조회수', t!.total_views.toLocaleString('ko-KR'), '공개 강의 상세가 열릴 때마다 증가', 'blue', Eye)}
            {stat('총 수강 등록', t!.total_enrollments.toLocaleString('ko-KR'), '전 강의 누적 수강 신청 수', 'green', Users)}
            {stat('총 매출', formatWon(t!.gross_revenue), '수강가 × 수강 인원 합(현재 강의가 기준)', 'amber', Wallet)}
            {stat('수수료', formatWon(t!.platform_fee), `${feePct}%`, 'violet', TrendingUp)}
            {stat('예상 정산', formatWon(t!.net_revenue), '매출 − 수수료', 'green', Wallet)}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <Button size="md" style={{ display: 'inline-flex', gap: 8 }} onClick={() => nav('/teacher/courses/new')}>
              <Plus size={18} />
              새 강의 만들기
            </Button>
            <Button variant="secondary" size="md" style={{ display: 'inline-flex', gap: 8 }} onClick={() => nav('/teacher/courses')}>
              <BookOpen size={18} />
              내 강의 관리
            </Button>
            <Button variant="secondary" size="md" style={{ display: 'inline-flex', gap: 8 }} onClick={() => nav('/teacher/feedback')}>
              <MessageSquare size={18} />
              피드백 관리
            </Button>
          </div>

          <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800 }}>강의별 성과</h3>
          <div style={{ overflowX: 'auto', marginBottom: 28, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
              <thead>
                <tr style={{ background: 'var(--color-neutral-100)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>강의</th>
                  <th style={{ padding: '10px 12px' }}>조회</th>
                  <th style={{ padding: '10px 12px' }}>수강</th>
                  <th style={{ padding: '10px 12px' }}>매출</th>
                  <th style={{ padding: '10px 12px' }}>수수료</th>
                  <th style={{ padding: '10px 12px' }}>정산</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--color-neutral-200)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      <button
                        type="button"
                        onClick={() => nav(`/teacher/courses/${c.id}/edit`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: 'var(--color-primary-700)',
                          font: 'inherit',
                          fontWeight: 600,
                          textAlign: 'left',
                        }}
                      >
                        {c.title}
                      </button>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                        {c.is_published ? '공개' : '비공개'} · {formatPrice(c.price)}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{c.view_count.toLocaleString('ko-KR')}</td>
                    <td style={{ padding: '10px 12px' }}>{c.enrollment_count}</td>
                    <td style={{ padding: '10px 12px' }}>{formatWon(c.gross_revenue)}</td>
                    <td style={{ padding: '10px 12px' }}>{formatWon(c.platform_fee)}</td>
                    <td style={{ padding: '10px 12px' }}>{formatWon(c.net_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && (
              <p style={{ margin: 0, padding: 20, color: 'var(--color-neutral-500)', fontSize: 14 }}>등록된 강의가 없습니다.</p>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              color: 'var(--color-neutral-700)',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--color-primary-500)' }} />
            최근 강의 (빠른 이동)
          </div>

          {recent.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 15 }}>
              아직 만든 강의가 없습니다. 위의 <strong>새 강의 만들기</strong>로 첫 강의를 등록해 보세요.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/teacher/courses/${c.id}/edit`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      background: 'var(--color-neutral-50)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{c.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 2 }}>
                        조회 {c.view_count} · 수강 {c.enrollment_count} · {formatWon(c.net_revenue)} 정산
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: c.is_published ? 'var(--color-success-50)' : 'var(--color-neutral-200)',
                        color: c.is_published ? 'var(--color-success-700)' : 'var(--color-neutral-600)',
                        flexShrink: 0,
                      }}
                    >
                      {c.is_published ? '공개' : '비공개'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--color-neutral-500)' }}>
            전체 강의 {courses.length}개 · 공개 {pub}개
          </div>
        </>
      )}
    </TeacherWorkspace>
  );
}
