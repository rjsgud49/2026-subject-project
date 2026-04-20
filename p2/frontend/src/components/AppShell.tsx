import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, roleHome } from '../auth/AuthContext';
import type { UserRole } from '../lib/api';

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      end={to === '/admin' || to === '/teacher' || to === '/student'}
    >
      {children}
    </NavLink>
  );
}

export default function AppShell({ area }: { area: UserRole }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (!user) return null;

  return (
    <div>
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
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => nav(roleHome(user.role))}
            role="presentation"
            style={{ fontSize: 18, fontWeight: 800, cursor: 'pointer', marginRight: 8 }}
          >
            면접<span style={{ color: 'var(--color-primary-500)' }}>인강</span>
          </div>
          <span className="badge badge-primary">
            {user.role === 'admin' ? '관리자' : user.role === 'teacher' ? '강사' : '학생'}
          </span>
          <nav style={{ display: 'flex', gap: 4, marginLeft: 6, flex: 1, flexWrap: 'wrap' }}>
            {area === 'admin' && (
              <>
                <NavItem to="/admin">대시보드</NavItem>
                <NavItem to="/admin/users">회원·역할</NavItem>
                <NavItem to="/admin/courses">전체 강의</NavItem>
              </>
            )}
            {area === 'teacher' && (
              <>
                <NavItem to="/teacher">대시보드</NavItem>
                <NavItem to="/teacher/courses">내 강의</NavItem>
                <NavItem to="/teacher/courses/new">강의 만들기</NavItem>
                <NavItem to="/teacher/feedback">피드백 관리</NavItem>
                <NavItem to="/teacher/profile">프로필</NavItem>
              </>
            )}
            {area === 'student' && (
              <>
                <NavItem to="/student">대시보드</NavItem>
                <NavItem to="/student/browse">강의 둘러보기</NavItem>
                <NavItem to="/student/my">내 수강</NavItem>
                <NavItem to="/student/feedback">피드백 요청</NavItem>
              </>
            )}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>{user.name}님</span>
            <button
              type="button"
              className="btn"
              style={{ padding: '8px 12px' }}
              onClick={() => {
                logout();
                nav('/');
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="page-container" style={{ minHeight: 'calc(100dvh - var(--nav-h))', paddingTop: 22 }}>
        <Outlet />
      </main>
    </div>
  );
}
