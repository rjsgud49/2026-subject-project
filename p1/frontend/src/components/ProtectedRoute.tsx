import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAppSelector((s) => s.user.user);
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return children;
}

