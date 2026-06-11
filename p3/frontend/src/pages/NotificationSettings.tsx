import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { api } from '../lib/api';

const CHANNEL_LABEL = { email: '이메일', discord: 'Discord' } as const;

export default function NotificationSettings() {
  const [events, setEvents] = useState<string[]>([]);
  const [subs, setSubs] = useState<Awaited<ReturnType<typeof api.notifications.list>>>([]);
  const [channel, setChannel] = useState<'email' | 'discord'>('email');
  const [target, setTarget] = useState('');
  const [picked, setPicked] = useState<string[]>(['payment_success', 'feedback_answered']);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [emailDelivery, setEmailDelivery] = useState(true);

  const load = () => {
    api.notifications.list().then(setSubs).catch((e: Error) => setErr(e.message));
  };

  useEffect(() => {
    api.notifications.events()
      .then((r) => setEvents(r.events))
      .catch((e: Error) => setErr(e.message || '이벤트 목록을 불러오지 못했습니다.'));
    api.notifications.capabilities()
      .then((c) => setEmailDelivery(!!c.email_delivery))
      .catch(() => setEmailDelivery(false));
    load();
  }, []);

  const toggleEvent = (ev: string) => {
    setPicked((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]));
  };

  const save = async () => {
    setErr('');
    setMsg('');
    try {
      await api.notifications.upsert({ channel, target, event_types: picked });
      setTarget('');
      setMsg('구독이 저장되었습니다.');
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : '저장 실패');
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ marginBottom: 16 }}>
        <Link to="/dashboard">← 내 강의실</Link>
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>알림 구독</h1>
      <p style={{ color: 'var(--color-neutral-500)', fontSize: 14, marginBottom: 24 }}>
        결제·피드백·Q&amp;A 등 이벤트를 이메일 또는 Discord로 받습니다.
      </p>
      {err && <p style={{ color: 'var(--color-error-600)' }}>{err}</p>}
      {msg && <p style={{ color: 'var(--color-success-600)' }}>{msg}</p>}
      {channel === 'email' && !emailDelivery && (
        <p style={{ fontSize: 13, color: 'var(--color-warning-800)', background: 'var(--color-warning-50)', border: '1px solid var(--color-warning-200)', padding: '12px 14px', borderRadius: 8, marginBottom: 16, lineHeight: 1.6 }}>
          서버에 SMTP가 설정되어 있지 않아 이메일 알림은 실제로 발송되지 않습니다. Discord Webhook을 사용하거나 운영 환경에 <code>SMTP_HOST</code> 등을 설정해 주세요.
        </p>
      )}

      <div style={{ display: 'grid', gap: 12, maxWidth: 480, marginBottom: 28 }}>
        <label style={{ fontSize: 14, fontWeight: 600 }}>채널</label>
        <select className="ui-select" value={channel} onChange={(e) => setChannel(e.target.value as 'email' | 'discord')}>
          <option value="email">이메일</option>
          <option value="discord">Discord Webhook</option>
        </select>
        <label style={{ fontSize: 14, fontWeight: 600 }}>대상</label>
        <input
          className="ui-input"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={channel === 'email' ? 'you@example.com' : 'https://discord.com/api/webhooks/...'}
        />
        <div style={{ fontSize: 13, fontWeight: 600 }}>이벤트</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {events.map((ev) => (
            <button
              key={ev}
              type="button"
              onClick={() => toggleEvent(ev)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid var(--color-neutral-200)',
                background: picked.includes(ev) ? 'var(--color-primary-500)' : '#fff',
                color: picked.includes(ev) ? '#fff' : 'inherit',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {ev}
            </button>
          ))}
        </div>
        <Button onClick={save}>구독 추가/저장</Button>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>내 구독</h2>
      {subs.length === 0 && <p className="muted">등록된 구독이 없습니다.</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
        {subs.map((s) => (
          <li
            key={s.id}
            style={{
              padding: 12,
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <strong>{CHANNEL_LABEL[s.channel]}</strong> · {s.target}
              <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>
                {s.event_types.join(', ') || '전체'}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => api.notifications.remove(s.id).then(load)}>
              삭제
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
