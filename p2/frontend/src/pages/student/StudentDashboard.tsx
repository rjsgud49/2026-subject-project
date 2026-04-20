import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type EnrollmentRow } from '../../lib/api';

export default function StudentDashboard() {
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.enrollments
      .list()
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="page-pad">
      <h1 className="page-title">학생 홈</h1>
      <p className="muted">수강 중인 강의를 빠르게 확인합니다.</p>
      {err && <div className="alert error">{err}</div>}
      <div className="stack" style={{ marginBottom: 24 }}>
        <Link to="/student/browse" className="btn primary">
          강의 둘러보기
        </Link>
        <Link to="/student/my" className="btn secondary">
          내 수강 전체
        </Link>
        <Link to="/student/feedback" className="btn ghost">
          피드백 요청 관리
        </Link>
      </div>
      <h2 className="section-title">최근 수강</h2>
      {rows.length === 0 && <p className="muted">아직 수강 중인 강의가 없습니다.</p>}
      <ul className="link-list">
        {rows.slice(0, 5).map((r) => (
          <li key={r.id}>
            <Link to={`/courses/${r.course_id}`}>{r.course?.title ?? `강의 #${r.course_id}`}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
