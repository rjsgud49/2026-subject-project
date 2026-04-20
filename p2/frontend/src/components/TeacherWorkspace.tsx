import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  MessageSquare,
  User,
  GraduationCap,
  Landmark,
} from 'lucide-react';

type NavDef = {
  to: string;
  label: string;
  Icon: typeof LayoutDashboard;
  end?: boolean;
  match?: (pathname: string) => boolean;
};

const NAV: NavDef[] = [
  { to: '/teacher', label: '대시보드', Icon: LayoutDashboard, end: true },
  {
    to: '/teacher/courses',
    label: '내 강의',
    Icon: BookOpen,
    match: (p) =>
      p === '/teacher/courses' || /^\/teacher\/courses\/\d+\/edit$/.test(p),
  },
  { to: '/teacher/courses/new', label: '새 강의', Icon: PlusCircle },
  { to: '/teacher/feedback', label: '피드백', Icon: MessageSquare },
  { to: '/teacher/settlement', label: '정산계좌', Icon: Landmark },
  { to: '/teacher/profile', label: '프로필', Icon: User },
];

export default function TeacherWorkspace({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        minHeight: 'calc(100dvh - var(--nav-h))',
        background:
          'linear-gradient(165deg, var(--color-primary-50) 0%, var(--color-neutral-50) 42%, var(--color-neutral-100) 100%)',
        padding: '24px 16px 40px',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-w)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            color: 'var(--color-neutral-600)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <GraduationCap size={18} style={{ color: 'var(--color-primary-600)' }} />
          <span style={{ color: 'var(--color-neutral-800)' }}>강사 스튜디오</span>
          <span style={{ color: 'var(--color-neutral-300)' }} aria-hidden>
            /
          </span>
          <span>강의 · 피드백 · 프로필을 한곳에서 관리합니다</span>
        </div>

        <div
          className="teacher-ws-layout"
          style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}
        >
          <aside
            className="teacher-ws-aside"
            style={{
              flexShrink: 0,
              width: '100%',
              maxWidth: 240,
              background: 'var(--color-neutral-0)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-neutral-200)',
              boxShadow: 'var(--shadow-sm)',
              padding: 12,
              position: 'sticky',
              top: 'calc(var(--nav-h) + 16px)',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }} aria-label="강사 메뉴">
              {NAV.map(({ to, label, Icon, end, match }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  style={({ isActive }) => {
                    const active = match ? match(pathname) : isActive;
                    return {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      textDecoration: 'none',
                      color: active ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                      background: active ? 'var(--color-primary-50)' : 'transparent',
                      border: active ? '1px solid var(--color-primary-100)' : '1px solid transparent',
                      transition: 'background 150ms, color 150ms, border-color 150ms',
                    };
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <section style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--color-neutral-900)',
                  }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--color-neutral-500)', maxWidth: 640 }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div> : null}
            </div>

            <div
              className="page-enter"
              style={{
                background: 'var(--color-neutral-0)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-neutral-200)',
                boxShadow: 'var(--shadow-md)',
                padding: '24px 22px',
              }}
            >
              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
