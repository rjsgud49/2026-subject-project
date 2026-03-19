import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { logout } from '../features/userSlice';
import Button from '../components/Button';

export default function MainLayout() {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

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
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" style={{ padding: '8px 14px', color: 'inherit' }}>
              강의
            </Link>
            <Link to="/dashboard" style={{ padding: '8px 14px', color: 'inherit' }}>
              내 강의실
            </Link>
            <Link to="/cart" style={{ padding: '8px 14px', color: 'inherit' }}>
              장바구니
            </Link>
          </nav>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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

