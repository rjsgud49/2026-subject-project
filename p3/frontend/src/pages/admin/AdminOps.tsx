import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { api } from '../../lib/api';

export default function AdminOps() {
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof api.admin.metrics>> | null>(null);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof api.admin.auditLogs>>>([]);
  const [webhooks, setWebhooks] = useState<Awaited<ReturnType<typeof api.admin.webhooks>>>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    api.admin.metrics().then(setMetrics).catch((e: Error) => setErr(e.message));
    api.admin.auditLogs().then(setLogs);
    api.admin.webhooks().then(setWebhooks);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const createWebhook = async () => {
    try {
      const r = await api.admin.createWebhook({
        name,
        url,
        events: ['payment_success', 'enrollment', 'feedback_answered'],
      });
      setSecret(r.secret ?? '');
      setName('');
      setUrl('');
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Webhook 등록 실패');
    }
  };

  return (
    <div className="page-pad">
      <p>
        <Link to="/admin">← 관리자</Link>
      </p>
      <h1 className="page-title">운영 · 모니터링</h1>
      {err && <p className="alert error">{err}</p>}

      {metrics && (
        <div className="stack" style={{ marginBottom: 24 }}>
          <h2 className="section-title">메트릭</h2>
          <p className="muted">
            uptime {metrics.uptime_sec}s · 요청 {metrics.http_requests_total} · 오류 {metrics.http_errors_total} (
            {metrics.error_rate}%)
          </p>
        </div>
      )}

      <h2 className="section-title">Outbound Webhook</h2>
      <div className="stack" style={{ marginBottom: 16, maxWidth: 520 }}>
        <input className="ui-input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="ui-input" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button onClick={createWebhook}>Webhook 등록</Button>
        {secret && (
          <p style={{ fontSize: 13, color: 'var(--color-warning-800)' }}>
            secret (한 번만 표시): <code>{secret}</code>
          </p>
        )}
      </div>
      <ul className="link-list">
        {webhooks.map((w) => (
          <li key={w.id}>
            {w.name} — {w.url}{' '}
            <Button variant="secondary" size="sm" onClick={() => api.admin.deleteWebhook(w.id).then(load)}>
              삭제
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="section-title" style={{ marginTop: 32 }}>
        감사 로그
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">시각</th>
              <th align="left">action</th>
              <th align="left">resource</th>
              <th align="left">user</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={{ borderTop: '1px solid var(--color-neutral-200)' }}>
                <td>{new Date(l.created_at).toLocaleString('ko-KR')}</td>
                <td>{l.action}</td>
                <td>
                  {l.resource}
                  {l.resource_id ? `#${l.resource_id}` : ''}
                </td>
                <td>{l.user_id ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
