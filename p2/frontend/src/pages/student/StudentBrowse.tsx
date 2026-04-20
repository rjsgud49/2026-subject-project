import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type CoursePublic } from '../../lib/api';
import { formatPrice } from '../../utils/format';

export default function StudentBrowse() {
  const [items, setItems] = useState<CoursePublic[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.courses
      .list(1, 24)
      .then((d) => setItems(d.items))
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="page-pad">
      <h1 className="page-title">강의 둘러보기</h1>
      <p className="muted">공개된 강의만 표시됩니다. 카드를 눌러 상세에서 수강 신청하세요.</p>
      {err && <div className="alert error">{err}</div>}
      <div className="course-grid">
        {items.map((c) => (
          <Link key={c.id} to={`/courses/${c.id}`} className="course-card">
            <div className="course-thumb" />
            <div className="course-body">
              <h3>{c.title}</h3>
              <p className="muted small line-clamp">{c.description}</p>
              <div className="course-meta">
                <span>{c.instructor?.name}</span>
                <strong>{formatPrice(c.price)}</strong>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && !err && <p className="muted">표시할 강의가 없습니다.</p>}
    </div>
  );
}
