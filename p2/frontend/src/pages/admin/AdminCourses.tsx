import { useEffect, useState } from 'react';
import { api, type AdminCourseRow } from '../../lib/api';
import { formatPrice, formatDate } from '../../utils/format';

export default function AdminCourses() {
  const [rows, setRows] = useState<AdminCourseRow[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.admin
      .courses()
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="page-pad">
      <h1 className="page-title">전체 강의</h1>
      <p className="muted">비공개 강의 포함 전체 목록입니다.</p>
      {err && <div className="alert error">{err}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>강사</th>
              <th>가격</th>
              <th>공개</th>
              <th>생성</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td>{r.instructor?.name ?? r.instructor_id}</td>
                <td>{formatPrice(r.price)}</td>
                <td>{r.is_published ? '예' : '아니오'}</td>
                <td className="muted small">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
