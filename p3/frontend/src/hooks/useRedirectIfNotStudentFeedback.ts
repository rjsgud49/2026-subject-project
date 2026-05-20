import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from './useRedux';

/** 학생 전용 `/feedback/*` — 강사·관리자는 각자 화면으로 보냄 */
export function useRedirectIfNotStudentFeedback() {
  const user = useAppSelector((s) => s.user.user);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'teacher') nav('/teacher/feedback', { replace: true });
    else if (user.role === 'admin') nav('/admin', { replace: true });
  }, [user, nav]);
}
