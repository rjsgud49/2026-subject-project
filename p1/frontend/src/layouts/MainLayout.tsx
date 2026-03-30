import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../features/userSlice';
import { useFeedbackTickets } from '../hooks/useFeedbackTickets';
import Button from '../components/Button';

export default function MainLayout() {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { tickets } = useFeedbackTickets();
  const totalTickets = tickets.doc + tickets.video + tickets.premium;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const isFeedback = pathname.startsWith('/feedback');

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <Link to="/" style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', textDecoration: 'none' }}>
            면접<span style={{ color: 'var(--color-accent)' }}>인강</span>
          </Link>
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" style={{ padding: '8px 14px', color: 'inherit', fontWeight: pathname === '/courses' ? 700 : 400 }}>
              강의
            </Link>
            <Link to="/dashboard" style={{ padding: '8px 14px', color: 'inherit', fontWeight: pathname === '/dashboard' ? 700 : 400 }}>
              내 강의실
            </Link>
            <Link to="/cart" style={{ padding: '8px 14px', color: 'inherit', fontWeight: pathname === '/cart' ? 700 : 400 }}>
              장바구니
            </Link>
          </nav>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* 피드백 드롭다운 */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setFeedbackOpen(true)}
              onMouseLeave={() => setFeedbackOpen(false)}
            >
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  color: isFeedback ? '#fff' : 'var(--color-brand-dark)',
                  fontWeight: 700,
                  border: '1.5px solid var(--color-brand)',
                  borderRadius: 20,
                  fontSize: 14,
                  background: isFeedback ? 'var(--color-brand)' : 'var(--color-brand-soft)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🎓 피드백
                {totalTickets > 0 && (
                  <span style={{ background: isFeedback ? 'rgba(255,255,255,0.3)' : 'var(--color-brand)', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 11, fontWeight: 800 }}>
                    {totalTickets}
                  </span>
                )}
                <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
              </button>
              {feedbackOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: 170,
                    zIndex: 100,
                    overflow: 'hidden',
                  }}
                >
                  {[
                    { to: '/feedback',         label: '🏠 피드백 홈' },
                    { to: '/feedback/buy',     label: '🎟️ 이용권 구매' },
                    { to: '/feedback/new',     label: '📤 피드백 신청' },
                    { to: '/feedback/history', label: '📂 신청 내역' },
                  ].map((item, i, arr) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setFeedbackOpen(false)}
                      style={{
                        display: 'block',
                        padding: '11px 16px',
                        fontSize: 14,
                        color: 'inherit',
                        textDecoration: 'none',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : undefined,
                        background: pathname === item.to ? 'var(--color-brand-soft)' : '#fff',
                        fontWeight: pathname === item.to ? 700 : 400,
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>{user.name}님</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    dispatch(logout());
                    nav('/');
                  }}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">시작하기</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </main>
      <footer
        style={{
          padding: '40px 24px',
          background: '#1f2937',
          color: '#9ca3af',
          fontSize: 14,
          marginTop: 64,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>© 면접 인강 P1 · 교육용 프로젝트</div>
      </footer>
    </>
  );
}

