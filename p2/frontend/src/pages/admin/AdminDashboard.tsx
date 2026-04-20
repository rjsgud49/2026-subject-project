import { useEffect, useState } from 'react';
import { api, type AdminStats } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.admin
      .stats()
      .then(setStats)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="page-pad">
      <h1 className="page-title">관리자 대시보드</h1>
      <p className="muted">플랫폼 전체 규모를 한눈에 확인합니다.</p>
      {err && <div className="alert error">{err}</div>}
      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">전체 회원</span>
            <strong className="stat-num">{stats.users}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">강의 수</span>
            <strong className="stat-num">{stats.courses}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">수강 건수</span>
            <strong className="stat-num">{stats.enrollments}</strong>
          </div>
          <div className="stat-card wide">
            <span className="stat-label">역할별 회원</span>
            <div className="role-bars">
              <span>관리자 {stats.byRole.admin}</span>
              <span>강사 {stats.byRole.teacher}</span>
              <span>학생 {stats.byRole.student}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
