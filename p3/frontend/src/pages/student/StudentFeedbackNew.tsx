import { Navigate } from 'react-router-dom';

/** 이용권 기반 신청은 /feedback/new 로 통일 */
export default function StudentFeedbackNew() {
  return <Navigate to="/feedback/new" replace />;
}
