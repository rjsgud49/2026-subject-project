import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import type { ReactNode } from 'react';

function roleHome(role: string) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/dashboard';
}

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: readonly string[];
}) {
  const user = useAppSelector((s) => s.user.user);
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  if (roles?.length && user.role && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return children;
}

