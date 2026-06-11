import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { formatDate } from '../../utils/format';

type PendingReview = {
  id: number;
  display_name: string;
  tagline: string | null;
  rating: number;
  text: string;
  created_at: string;
};

export default function AdminReviews() {
  const [rows, setRows] = useState<PendingReview[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api.admin
      .pendingReviews()
      .then(setRows)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: number) => {
    try {
      await api.admin.approveReview(id);
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '승인 실패');
    }
  };

  const reject = async (id: number) => {
    if (!window.confirm('이 리뷰를 삭제할까요?')) return;
    try {
      await api.admin.rejectReview(id);
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '거절 실패');
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ marginBottom: 16 }}>
        <Link to="/admin">← 관리자 홈</Link>
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>리뷰 검수</h1>
      <p style={{ color: 'var(--color-neutral-500)', fontSize: 14, marginBottom: 24 }}>
        랜딩 페이지 후기는 승인 후에만 공개됩니다.
      </p>
      {err && <p style={{ color: 'var(--color-error-600)' }}>{err}</p>}
      {loading ? (
        <p style={{ color: 'var(--color-neutral-500)' }}>불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-500)' }}>대기 중인 리뷰가 없습니다.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '16px 18px',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-neutral-0)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <div>
                  <strong>{r.display_name}</strong>
                  {r.tagline && <span style={{ marginLeft: 8, color: 'var(--color-neutral-500)', fontSize: 13 }}>{r.tagline}</span>}
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
                  ★ {r.rating} · {formatDate(r.created_at)}
                </span>
              </div>
              <p style={{ margin: '0 0 12px', lineHeight: 1.65, fontSize: 14 }}>{r.text}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" onClick={() => void approve(r.id)}>승인</Button>
                <Button size="sm" variant="secondary" onClick={() => void reject(r.id)}>거절</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
