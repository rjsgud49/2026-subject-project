import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type FeedbackRow } from '../../lib/api';
import { formatDate } from '../../utils/format';

const STATUS_LABEL: Record<FeedbackRow['status'], string> = {
  pending: '접수',
  in_progress: '검토 중',
  answered: '답변 완료',
};

export default function StudentFeedbackList() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.feedback
      .mine()
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="page-pad">
      <div className="row-between">
        <div>
          <h1 className="page-title">내 피드백 요청</h1>
          <p className="muted">강사의 질의와 최종 피드백을 확인할 수 있습니다.</p>
        </div>
        <Link to="/student/feedback/new" className="btn primary">
          + 새 요청
        </Link>
      </div>
      {err && <div className="alert error">{err}</div>}

      <div className="stack" style={{ marginTop: 16, gap: 12 }}>
        {rows.map((r) => (
          <article key={r.id} className="card">
            <div className="row-between" style={{ alignItems: 'center' }}>
              <strong>{r.title}</strong>
              <span className="small muted">{STATUS_LABEL[r.status]}</span>
            </div>
            <p className="muted small" style={{ margin: '8px 0 0' }}>
              요청일 {formatDate(r.created_at)}
            </p>
            <div style={{ marginTop: 12 }}>
              <div className="small muted">내 질문</div>
              <p style={{ marginTop: 4 }}>{r.student_question}</p>
            </div>
            {r.teacher_question && (
              <div style={{ marginTop: 10 }}>
                <div className="small muted">강사 질의</div>
                <p style={{ marginTop: 4 }}>{r.teacher_question}</p>
              </div>
            )}
            {r.teacher_feedback && (
              <div style={{ marginTop: 10 }}>
                <div className="small muted">강사 피드백</div>
                <p style={{ marginTop: 4 }}>{r.teacher_feedback}</p>
              </div>
            )}
          </article>
        ))}
      </div>

      {rows.length === 0 && !err && <p className="muted">아직 요청 내역이 없습니다.</p>}
    </div>
  );
}
