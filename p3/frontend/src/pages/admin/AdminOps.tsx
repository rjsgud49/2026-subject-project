import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Bell,
  Clock,
  Copy,
  RefreshCw,
  Server,
  Trash2,
  Webhook,
  Zap,
} from 'lucide-react';
import Button from '../../components/Button';
import { api, type AuditLogRow, type OpsMetrics, type WebhookRow } from '../../lib/api';
import {
  auditActionLabel,
  eventLabel,
  formatUptime,
  OPS_EVENT_HINTS,
  OPS_EVENT_LABELS,
} from '../../utils/opsLabels';

type Tab = 'overview' | 'webhooks' | 'logs';

function MetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  tone: 'blue' | 'green' | 'amber' | 'red';
}) {
  const palette = {
    blue: { border: 'var(--color-primary-100)', bg: 'var(--color-primary-50)', fg: 'var(--color-primary-700)' },
    green: { border: 'var(--color-success-100)', bg: 'var(--color-success-50)', fg: 'var(--color-success-700)' },
    amber: { border: 'var(--color-warning-100)', bg: 'var(--color-warning-50)', fg: 'var(--color-warning-700)' },
    red: { border: 'var(--color-error-100)', bg: 'var(--color-error-50)', fg: 'var(--color-error-700)' },
  }[tone];

  return (
    <div
      className="card"
      style={{
        flex: '1 1 140px',
        minWidth: 130,
        padding: '16px 18px',
        border: `1px solid ${palette.border}`,
        background: palette.bg,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-neutral-600)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: palette.fg, marginTop: 6, letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 6, lineHeight: 1.45 }}>{hint}</div>
    </div>
  );
}

function SectionCard({
  title,
  desc,
  icon: Icon,
  children,
}: {
  title: string;
  desc?: string;
  icon: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--color-neutral-200)',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--color-neutral-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color="var(--color-neutral-700)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h2>
          {desc && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>{desc}</p>
          )}
        </div>
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </section>
  );
}

export default function AdminOps() {
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<OpsMetrics | null>(null);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [events, setEvents] = useState<string[]>(Object.keys(OPS_EVENT_LABELS));
  const [emailDelivery, setEmailDelivery] = useState(false);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [pickedEvents, setPickedEvents] = useState<string[]>(['payment_success', 'enrollment', 'feedback_answered']);
  const [secret, setSecret] = useState('');
  const [copied, setCopied] = useState(false);

  const [err, setErr] = useState('');
  const [schedMsg, setSchedMsg] = useState('');
  const [testEvent, setTestEvent] = useState('payment_success');
  const [testMsg, setTestMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [busy, setBusy] = useState<'sched' | 'sched-force' | 'test' | 'webhook' | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [logFilter, setLogFilter] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setErr('');
    try {
      const [m, l, w] = await Promise.all([
        api.admin.metrics(),
        api.admin.auditLogs(),
        api.admin.webhooks(),
      ]);
      setMetrics(m);
      setLogs(l);
      setWebhooks(w);
      setLastUpdated(new Date());
    } catch (e) {
      setErr(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.notifications.events().then((r) => setEvents(r.events)).catch(() => {});
    api.notifications.capabilities().then((c) => setEmailDelivery(!!c.email_delivery)).catch(() => {});
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [load]);

  const errorTone = useMemo(() => {
    if (!metrics) return 'green' as const;
    if (metrics.error_rate >= 5) return 'red' as const;
    if (metrics.error_rate >= 1) return 'amber' as const;
    return 'green' as const;
  }, [metrics]);

  const filteredLogs = useMemo(() => {
    const q = logFilter.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        auditActionLabel(l.action).toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        String(l.user_id ?? '').includes(q),
    );
  }, [logs, logFilter]);

  const toggleEvent = (ev: string) => {
    setPickedEvents((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]));
  };

  const createWebhook = async () => {
    setErr('');
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName) {
      setErr('Webhook 이름을 입력해 주세요.');
      return;
    }
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setErr('Webhook URL은 http:// 또는 https:// 로 시작해야 합니다.');
      return;
    }
    if (pickedEvents.length === 0) {
      setErr('구독할 이벤트를 하나 이상 선택해 주세요.');
      return;
    }
    setBusy('webhook');
    try {
      const r = await api.admin.createWebhook({
        name: trimmedName,
        url: trimmedUrl,
        events: pickedEvents,
      });
      setSecret(r.secret ?? '');
      setCopied(false);
      setName('');
      setUrl('');
      await load(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Webhook 등록 실패');
    } finally {
      setBusy(null);
    }
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr('클립보드 복사에 실패했습니다. secret을 직접 복사해 주세요.');
    }
  };

  const removeWebhook = async (id: number, webhookName: string) => {
    if (!window.confirm(`"${webhookName}" Webhook을 삭제할까요?`)) return;
    setDeletingId(id);
    setErr('');
    try {
      await api.admin.deleteWebhook(id);
      await load(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Webhook 삭제 실패');
    } finally {
      setDeletingId(null);
    }
  };

  const runScheduler = async (force = false) => {
    setSchedMsg('');
    setErr('');
    setBusy(force ? 'sched-force' : 'sched');
    try {
      const r = await api.admin.runScheduler(force);
      setSchedMsg(
        force
          ? `시연 모드 완료 — pending 주문 ${r.expired_orders}건 만료, 피드백 알림 ${r.reminded_teachers}명`
          : `운영 규칙 실행 — 24시간 초과 pending ${r.expired_orders}건 만료, 피드백 알림 ${r.reminded_teachers}명`,
      );
      await load(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '스케줄 실행 실패');
    } finally {
      setBusy(null);
    }
  };

  const emitTest = async () => {
    setTestMsg('');
    setErr('');
    setBusy('test');
    try {
      const r = await api.admin.emitTestEvent(testEvent);
      setTestMsg(`「${eventLabel(r.event)}」 테스트 발송 완료 — 알림·Webhook 구독자에게 전달됩니다.`);
      await load(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '테스트 이벤트 실패');
    } finally {
      setBusy(null);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: '상태 · 작업' },
    { id: 'webhooks', label: 'Webhook' },
    { id: 'logs', label: '감사 로그' },
  ];

  return (
    <div className="page-pad">
      <Link
        to="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          color: 'var(--color-neutral-500)',
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={16} />
        관리자 대시보드
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 6 }}>
            운영 · 모니터링
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-500)', lineHeight: 1.55, maxWidth: 560 }}>
            서버 상태, 스케줄 작업, Webhook·알림 테스트, 감사 로그를 한 화면에서 관리합니다.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => load()} loading={refreshing} style={{ flexShrink: 0 }}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />
          새로고침
        </Button>
      </div>

      {err && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-50)',
            border: '1px solid var(--color-error-100)',
            color: 'var(--color-error-700)',
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <span>{err}</span>
          <button
            type="button"
            onClick={() => setErr('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1 }}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      )}

      {!emailDelivery && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-100)',
            color: 'var(--color-warning-700)',
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          SMTP 미설정 — 이메일 알림은 서버 로그로만 기록됩니다. Discord Webhook·Outbound Webhook은 정상 동작합니다.
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 20,
          padding: 4,
          background: 'var(--color-neutral-100)',
          borderRadius: 'var(--radius-lg)',
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? 'var(--color-neutral-0)' : 'transparent',
              color: tab === t.id ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)',
              boxShadow: tab === t.id ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
        {lastUpdated && (
          <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--color-neutral-400)', paddingLeft: 8 }}>
            {lastUpdated.toLocaleTimeString('ko-KR')} 갱신
          </span>
        )}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {loading && !metrics ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card" style={{ flex: '1 1 140px', minWidth: 130, height: 96, background: 'var(--color-neutral-100)' }} />
              ))}
            </div>
          ) : metrics ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <MetricCard label="가동 시간" value={formatUptime(metrics.uptime_sec)} hint="프로세스 재시작 시 초기화" tone="blue" />
              <MetricCard label="HTTP 요청" value={metrics.http_requests_total.toLocaleString()} hint="누적 API 요청 수" tone="green" />
              <MetricCard label="HTTP 오류" value={metrics.http_errors_total.toLocaleString()} hint="4xx·5xx 응답" tone={metrics.http_errors_total > 0 ? 'amber' : 'green'} />
              <MetricCard label="오류율" value={`${metrics.error_rate}%`} hint="요청 대비 오류 비율" tone={errorTone} />
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18 }}>
            <SectionCard
              title="스케줄 작업"
              desc="운영: pending 결제 24시간 만료(매시), 미답변 피드백 알림(매일 09:00 KST). 아래에서 즉시 실행할 수 있습니다."
              icon={Clock}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="secondary" onClick={() => runScheduler(false)} loading={busy === 'sched'}>
                  지금 실행 (24시간 규칙)
                </Button>
                <Button variant="ghost" onClick={() => runScheduler(true)} loading={busy === 'sched-force'} style={{ justifyContent: 'flex-start' }}>
                  시연: pending 주문 전부 만료
                </Button>
              </div>
              {schedMsg && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--color-success-700)', lineHeight: 1.5 }}>{schedMsg}</p>
              )}
            </SectionCard>

            <SectionCard
              title="이벤트 테스트"
              desc="선택한 이벤트를 즉시 발송합니다. 알림 구독·등록된 Outbound Webhook으로 전달됩니다."
              icon={Zap}
            >
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>이벤트 종류</label>
              <select
                className="ui-select"
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                style={{ width: '100%', marginBottom: 8 }}
              >
                {events.map((ev) => (
                  <option key={ev} value={ev}>
                    {eventLabel(ev)} ({ev})
                  </option>
                ))}
              </select>
              {OPS_EVENT_HINTS[testEvent] && (
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--color-neutral-500)' }}>{OPS_EVENT_HINTS[testEvent]}</p>
              )}
              <Button variant="secondary" onClick={emitTest} loading={busy === 'test'}>
                <Bell size={16} style={{ marginRight: 6 }} />
                테스트 발송
              </Button>
              {testMsg && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--color-success-700)', lineHeight: 1.5 }}>{testMsg}</p>
              )}
            </SectionCard>
          </div>

          <SectionCard title="등록된 Webhook 요약" desc={`총 ${events.length}개 이벤트 타입 · 활성 Webhook ${webhooks.filter((w) => w.enabled).length}개`} icon={Webhook}>
            {webhooks.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)' }}>
                등록된 Webhook이 없습니다. <button type="button" onClick={() => setTab('webhooks')} style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Webhook 탭</button>에서 추가하세요.
              </p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {webhooks.slice(0, 3).map((w) => (
                  <li key={w.id} style={{ fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <span>
                      <strong>{w.name}</strong>
                      <span style={{ color: 'var(--color-neutral-400)', margin: '0 6px' }}>·</span>
                      <span style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>{w.events.map(eventLabel).join(', ')}</span>
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: w.enabled ? 'var(--color-success-50)' : 'var(--color-neutral-100)',
                        color: w.enabled ? 'var(--color-success-700)' : 'var(--color-neutral-500)',
                      }}
                    >
                      {w.enabled ? '활성' : '비활성'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {webhooks.length > 3 && (
              <button type="button" onClick={() => setTab('webhooks')} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                전체 {webhooks.length}개 보기 →
              </button>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'webhooks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 18, alignItems: 'start' }}>
          <SectionCard title="Webhook 등록" desc="HMAC 서명(X-P3-Signature)으로 POST합니다. secret은 등록 직후 한 번만 표시됩니다." icon={Webhook}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>이름</label>
                <input className="ui-input" placeholder="예: Slack 연동" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>수신 URL</label>
                <input className="ui-input" placeholder="https://example.com/webhook" value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>구독 이벤트</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {events.map((ev) => {
                    const on = pickedEvents.includes(ev);
                    return (
                      <button
                        key={ev}
                        type="button"
                        onClick={() => toggleEvent(ev)}
                        title={OPS_EVENT_HINTS[ev]}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          border: `1px solid ${on ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                          background: on ? 'var(--color-primary-500)' : 'var(--color-neutral-0)',
                          color: on ? '#fff' : 'var(--color-neutral-700)',
                          fontSize: 12,
                          fontWeight: on ? 600 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {eventLabel(ev)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button onClick={createWebhook} loading={busy === 'webhook'} disabled={!name.trim() || !url.trim() || pickedEvents.length === 0}>
                Webhook 등록
              </Button>
              {secret && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-warning-50)',
                    border: '1px solid var(--color-warning-100)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-warning-800)', marginBottom: 6 }}>Secret (한 번만 표시)</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <code style={{ wordBreak: 'break-all', flex: 1, fontSize: 12 }}>{secret}</code>
                    <Button variant="secondary" size="sm" onClick={copySecret}>
                      <Copy size={14} style={{ marginRight: 4 }} />
                      {copied ? '복사됨' : '복사'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title={`등록 목록 (${webhooks.length})`} icon={Server}>
            {webhooks.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)', lineHeight: 1.6 }}>
                아직 Webhook이 없습니다. 왼쪽 폼에서 URL과 이벤트를 선택해 등록하세요.
                <br />
                <span style={{ fontSize: 12 }}>로컬 테스트: <code>p3/scripts/demo-webhook-receiver.mjs</code> + ngrok</span>
              </p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {webhooks.map((w) => (
                  <li
                    key={w.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-neutral-200)',
                      background: 'var(--color-neutral-50)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{w.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4, wordBreak: 'break-all' }}>{w.url}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {w.events.map((ev) => (
                            <span
                              key={ev}
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                borderRadius: 999,
                                background: 'var(--color-primary-50)',
                                color: 'var(--color-primary-700)',
                                fontWeight: 600,
                              }}
                            >
                              {eventLabel(ev)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebhook(w.id, w.name)}
                        loading={deletingId === w.id}
                        style={{ color: 'var(--color-error-600)', flexShrink: 0 }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'logs' && (
        <SectionCard title="감사 로그" desc="관리자·운영 API 호출 기록 (최근 80건)" icon={Activity}>
          <div style={{ marginBottom: 14 }}>
            <input
              className="ui-input"
              placeholder="action, resource, user_id 검색..."
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              style={{ maxWidth: 360, width: '100%' }}
            />
          </div>
          {filteredLogs.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)' }}>
              {logs.length === 0 ? '아직 감사 로그가 없습니다. Webhook 등록·스케줄 실행·테스트 이벤트를 시도해 보세요.' : '검색 결과가 없습니다.'}
            </p>
          ) : (
            <div style={{ overflowX: 'auto', margin: '0 -4px' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr style={{ background: 'var(--color-neutral-50)' }}>
                    {['시각', '작업', '리소스', '사용자'].map((h) => (
                      <th
                        key={h}
                        align="left"
                        style={{
                          padding: '10px 12px',
                          fontWeight: 700,
                          color: 'var(--color-neutral-600)',
                          borderBottom: '1px solid var(--color-neutral-200)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--color-neutral-600)' }}>
                        {new Date(l.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{auditActionLabel(l.action)}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 2 }}>{l.action}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {l.resource}
                        {l.resource_id ? `#${l.resource_id}` : ''}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-neutral-600)' }}>{l.user_id ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
