import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import TeacherWorkspace from '../../components/TeacherWorkspace';
import Button from '../../components/Button';
import { useAppDispatch } from '../../hooks/useRedux';
import { setUser } from '../../features/userSlice';
import { api } from '../../lib/api';

export default function TeacherSettlement() {
  const dispatch = useAppDispatch();
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [holder, setHolder] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : '저장 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <TeacherWorkspace
      title="정산 계좌"
      subtitle="수익 정산 시 입금될 계좌입니다. 수강생에게 공개되지 않으며, 운영팀이 정산 절차에만 사용합니다."
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
    </TeacherWorkspace>
  );
}
