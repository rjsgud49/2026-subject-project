import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { useAppDispatch } from '../../hooks/useRedux';
import { setUser } from '../../features/userSlice';
import { api, type TeacherRevenueLedgerResponse } from '../../lib/api';

export default function TeacherSettlement() {
  const dispatch = useAppDispatch();
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [holder, setHolder] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [ledger, setLedger] = useState<TeacherRevenueLedgerResponse | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLoading, setLedgerLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.auth
      .me()
      .then((u) => {
        if (!alive) return;
        setBank(u.settlement_bank ?? '');
        setAccountNo(u.settlement_account_no ?? '');
        setHolder(u.settlement_holder ?? '');
      })
      .catch((e: Error) => {
        if (alive) setErr(e.message);
      })
      .finally(() => {
        if (alive) setInitialLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLedgerLoading(true);
    api.teacher
      .settlementLedger(ledgerPage, 10)
      .then((data) => {
        if (alive) setLedger(data);
      })
      .catch(() => {
        if (alive) setLedger(null);
      })
      .finally(() => {
        if (alive) setLedgerLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [ledgerPage]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setOk('');
    setLoading(true);
    try {
      await api.teacher.updateProfile({
        settlement_bank: bank.trim(),
        settlement_account_no: accountNo.replace(/\s/g, '').trim(),
        settlement_holder: holder.trim(),
      });
      const me = await api.auth.me();
      dispatch(setUser(me));
      setBank(me.settlement_bank ?? '');
      setAccountNo(me.settlement_account_no ?? '');
      setHolder(me.settlement_holder ?? '');
      setOk('정산 계좌 정보가 저장되었습니다.');
      setLedgerPage(1);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '저장 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <TeacherWorkspace
      title="정산"
      subtitle="수익 원장은 수강 신청 시점 강의 가격 기준으로 DB에 기록됩니다. 아래 계좌는 정산 입금용이며 수강생에게 공개되지 않습니다."
    >
      {initialLoading ? (
        <div className="skeleton" style={{ maxWidth: 520, height: 220, borderRadius: 12 }} />
      ) : (
        <form
          onSubmit={(e) => void onSubmit(e)}
          style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-100)',
              color: 'var(--color-primary-900)',
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            <Landmark size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              입력 정보는 본인 확인 및 정산 목적으로만 사용됩니다. 은행·계좌번호·예금주가 일치하는지 확인 후
              저장해 주세요.
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            은행명
            <input
              className="ui-input"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              maxLength={60}
              placeholder="예: 국민은행"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            계좌번호
            <input
              className="ui-input"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              maxLength={40}
              placeholder="숫자만 입력 (하이픈 없이 가능)"
              inputMode="numeric"
              autoComplete="off"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 600 }}>
            예금주
            <input
              className="ui-input"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              maxLength={100}
              placeholder="실명 (사업자면 법인명)"
            />
          </label>

          {err && (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-error-50)',
                border: '1px solid var(--color-error-100)',
                color: 'var(--color-error-700)',
                fontSize: 14,
              }}
            >
              {err}
            </div>
          )}
          {ok && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-success-50)',
                border: '1px solid var(--color-success-100)',
                color: 'var(--color-success-800)',
                fontSize: 14,
              }}
            >
              {ok}
            </div>
          )}
          <Button type="submit" size="md" loading={loading} disabled={loading}>
            저장
          </Button>
        </form>
      )}

      <section style={{ marginTop: 40, maxWidth: 960 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>수익 원장</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', marginBottom: 16 }}>
          수강 1건당 한 줄이며, 당시 강의 가격·수수료·강사 정산액이 저장됩니다.
        </p>
        {ledgerLoading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ) : !ledger?.items?.length ? (
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>아직 수익 원장이 없습니다. 수강 신청이 발생하면 표시됩니다.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)', borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--color-neutral-50)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>일시</th>
                    <th style={{ padding: '10px 12px' }}>강의</th>
                    <th style={{ padding: '10px 12px' }}>당시 가격</th>
                    <th style={{ padding: '10px 12px' }}>매출</th>
                    <th style={{ padding: '10px 12px' }}>수수료</th>
                    <th style={{ padding: '10px 12px' }}>정산(예상)</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.items.map((row) => (
                    <tr key={row.id} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {new Date(row.enrolled_at).toLocaleString('ko-KR')}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{row.course_title ?? `강의 #${row.course_id}`}</td>
                      <td style={{ padding: '10px 12px' }}>{Number(row.price_snapshot).toLocaleString('ko-KR')}원</td>
                      <td style={{ padding: '10px 12px' }}>{Number(row.gross_amount).toLocaleString('ko-KR')}원</td>
                      <td style={{ padding: '10px 12px' }}>{Number(row.platform_fee).toLocaleString('ko-KR')}원</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {Number(row.net_amount).toLocaleString('ko-KR')}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={ledgerPage <= 1}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
                {ledger.page} / {Math.max(1, Math.ceil(ledger.total / ledger.size))} 페이지 (총 {ledger.total}건)
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={ledgerPage * ledger.size >= ledger.total}
                onClick={() => setLedgerPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </>
        )}
      </section>
    </TeacherWorkspace>
  );
}
