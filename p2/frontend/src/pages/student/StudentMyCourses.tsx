import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type EnrollmentRow } from '../../lib/api';
import { formatPrice, formatDate } from '../../utils/format';

export default function StudentMyCourses() {
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [err, setErr] = useState('');

  function load() {
    api.enrollments
      .list()
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function drop(id: number) {
    if (!confirm('수강을 취소할까요?')) return;
    try {
      await api.enrollments.remove(id);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '취소 실패');
    }
  }

  return (
    <div className="page-pad">
      <h1 className="page-title">내 수강</h1>
      <p className="muted">신청한 강의와 수강 취소를 관리합니다.</p>
      {err && <div className="alert error">{err}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>강의</th>
              <th>가격</th>
              <th>수강일</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link to={`/courses/${r.course_id}`}>{r.course?.title ?? `#${r.course_id}`}</Link>
                </td>
                <td>{r.course ? formatPrice(r.course.price) : '-'}</td>
                <td className="muted small">{formatDate(r.enrolled_at)}</td>
                <td className="actions">
                  <button type="button" className="btn sm danger ghost" onClick={() => void drop(r.id)}>
                    수강 취소
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && !err && <p className="muted">수강 중인 강의가 없습니다.</p>}
    </div>
  );
}
