import { useState, useRef, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../features/userSlice';
import { setToken } from '../services/api';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import Button from '../components/Button';
import {
  BookOpen,
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

const FEEDBACK_ITEMS = [
  { to: '/feedback',         label: '피드백 홈' },
  { to: '/feedback/buy',     label: '이용권 구매' },
  { to: '/feedback/new',     label: '피드백 신청' },
  { to: '/feedback/history', label: '신청 내역' },
];

export default function MainLayout() {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isTeacher = user?.role === 'teacher';

  const { tickets } = useFeedbackTickets(!!user && !isTeacher);
  const totalTickets = user && !isTeacher ? tickets.doc + tickets.video + tickets.premium : 0;

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFeedback = pathname.startsWith('/feedback');

  const classroomPath =
    !user || user.role === 'student'
      ? '/dashboard'
      : user.role === 'admin'
        ? '/admin'
        : user.role === 'teacher'
          ? '/teacher'
          : '/dashboard';

  const navLinks = useMemo(() => {
    if (isTeacher) {
      return [{ to: classroomPath, label: '내 강의실', Icon: LayoutDashboard }] as const;
    }
    const core = [
      { to: '/courses', label: '강의', Icon: BookOpen },
      { to: classroomPath, label: '내 강의실', Icon: LayoutDashboard },
    ] as const;
    return [...core, { to: '/cart', label: '장바구니', Icon: ShoppingCart }] as const;
  }, [classroomPath, isTeacher]);

  const navItemActive = (to: string) => {
    if (to === '/courses') return pathname === '/courses' || pathname.startsWith('/courses/');
    if (to === '/cart') return pathname.startsWith('/cart');
    return (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/student')
    );
  };

  const handleFeedbackEnter = () => {
    if (feedbackTimer.current) { clearTimeout(feedbackTimer.current); feedbackTimer.current = null; }
    setFeedbackOpen(true);
  };
  const handleFeedbackLeave = () => {
    feedbackTimer.current = setTimeout(() => setFeedbackOpen(false), 150);
  };

  return (
    <>
      {/* ── Header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: 'var(--nav-h)',
          background: 'var(--color-neutral-0)',
          borderBottom: '1px solid var(--color-neutral-200)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-w)',
            margin: '0 auto',
            padding: '0 24px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Logo */}
          <Link
            to={isTeacher ? '/teacher' : '/'}
            style={{
              fontSize: 18, fontWeight: 800,
              color: 'var(--color-neutral-900)',
              textDecoration: 'none',
              marginRight: 8,
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            면접<span style={{ color: 'var(--color-primary-500)' }}>인강</span>
          </Link>

          {/* Main nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {navLinks.map(({ to, label, Icon }) => {
              const active = navItemActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 10px', fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-primary-600)' : 'var(--color-neutral-600)',
                    textDecoration: 'none', borderRadius: 6,
                    background: active ? 'var(--color-primary-50)' : 'transparent',
                    transition: 'background 150ms, color 150ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--color-neutral-100)';
                      e.currentTarget.style.color = 'var(--color-neutral-700)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-neutral-600)';
                    }
                  }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

            {/* 학생·비로그인: 피드백 이용권 메뉴 / 강사: 강사 스튜디오에서만 관리 */}
            {!isTeacher && (
              <div
                style={{ position: 'relative' }}
                onMouseEnter={handleFeedbackEnter}
                onMouseLeave={handleFeedbackLeave}
              >
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 32, padding: '0 10px', fontSize: 14,
                    fontWeight: isFeedback ? 600 : 500,
                    color: isFeedback ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                    background: isFeedback ? 'var(--color-primary-50)' : 'transparent',
                    border: isFeedback ? '1px solid var(--color-primary-200)' : '1px solid var(--color-neutral-200)',
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'background 150ms, border-color 150ms, color 150ms',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFeedback) {
                      e.currentTarget.style.background = 'var(--color-neutral-50)';
                      e.currentTarget.style.borderColor = 'var(--color-neutral-300)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFeedback) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                    }
                  }}
                >
                  <MessageSquare size={14} />
                  피드백
                  {user && totalTickets > 0 && (
                    <span
                      style={{
                        background: 'var(--color-primary-500)',
                        color: '#fff', borderRadius: 'var(--radius-full)',
                        padding: '0 6px', fontSize: 11, fontWeight: 700,
                        lineHeight: '18px', height: 18,
                        display: 'inline-flex', alignItems: 'center',
                      }}
                    >
                      {totalTickets}
                    </span>
                  )}
                  <ChevronDown size={12} />
                </button>

                {feedbackOpen && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--color-neutral-0)',
                      border: '1px solid var(--color-neutral-200)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: 160, zIndex: 20, overflow: 'hidden', padding: '4px 0',
                    }}
                  >
                    {FEEDBACK_ITEMS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setFeedbackOpen(false)}
                        style={{
                          display: 'block', padding: '9px 14px', fontSize: 14,
                          fontWeight: pathname === item.to ? 600 : 400,
                          color: pathname === item.to ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                          textDecoration: 'none',
                          background: pathname === item.to ? 'var(--color-primary-50)' : 'transparent',
                          transition: 'background 100ms',
                        }}
                        onMouseEnter={(e) => { if (pathname !== item.to) e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                        onMouseLeave={(e) => { if (pathname !== item.to) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Auth */}
            {user ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-500)', padding: '0 4px' }}>
                  {(user as any).name}님
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                  dispatch(logout());
                  setToken(null);
                  nav('/');
                }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <LogOut size={14} />
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <LogIn size={14} />
                    로그인
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <UserPlus size={14} />
                    시작하기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page ── */}
      <main style={{ minHeight: 'calc(100dvh - var(--nav-h))' }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          background: 'var(--color-neutral-900)',
          borderTop: '1px solid var(--color-neutral-800)',
          color: 'var(--color-neutral-500)',
          fontSize: 13,
          padding: '32px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-w)', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: 'var(--color-neutral-200)', fontSize: 15 }}>
              면접<span style={{ color: 'var(--color-primary-500)' }}>인강</span>
            </span>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-neutral-600)' }}>
              취업 준비를 위한 면접 강의 플랫폼 · 교육용 P1 프로젝트
            </p>
          </div>
          <p style={{ margin: 0 }}>© 2026 면접인강. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
