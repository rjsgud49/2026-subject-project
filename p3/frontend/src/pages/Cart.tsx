import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  fetchCart,
  removeFromCartThunk,
  clearCartMessage,
} from '../features/cartSlice';
import { fetchEnrollments, setCheckoutCourseIds } from '../features/enrollmentSlice';
import Button from '../components/Button';
import { formatPrice } from '../utils/format';
import { openNicePayCheckout } from '../utils/nicepay';
import { api } from '../services/api';
import { Lock, ShoppingCart, Trash2, CreditCard } from 'lucide-react';

export default function Cart() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { items, status, error, lastAction } = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.user.user);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [removing, setRemoving] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    setSelected(new Set((items || []).map((i: { course_id: number }) => Number(i.course_id))));
  }, [items]);

  useEffect(() => {
    if (lastAction?.type === 'error') {
      const t = window.setTimeout(() => dispatch(clearCartMessage()), 5000);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [lastAction, dispatch]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const total = (items || [])
    .filter((i: { course_id: number }) => selected.has(Number(i.course_id)))
    .reduce((s: number, i: { price?: number }) => s + Number(i.price || 0), 0);

  const checkout = async () => {
    const ids = [...selected];
    if (!ids.length) {
      window.alert('선택한 강의가 없습니다.');
      return;
    }
    setCheckingOut(true);
    try {
      const prep = await api.payments.prepare(ids);
      if (prep.free) {
        const free = await api.payments.freeCheckout(ids);
        dispatch(setCheckoutCourseIds(free.course_ids ?? ids));
        dispatch(fetchEnrollments());
        dispatch(fetchCart());
        nav('/checkout/complete?status=ok&free=1');
        return;
      }
      dispatch(setCheckoutCourseIds(ids as number[]));
      await openNicePayCheckout(prep, {
        name: user?.name,
        email: user?.email,
      });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '결제를 시작할 수 없습니다.');
    } finally {
      setCheckingOut(false);
    }
  };

  const selectAll = () => {
    setSelected(new Set((items || []).map((i: { course_id: number }) => Number(i.course_id))));
  };

  const deselectAll = () => setSelected(new Set());

  const removeSelected = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    setRemoving(true);
    try {
      for (const id of ids) {
        await dispatch(removeFromCartThunk(id)).unwrap();
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '일부 항목을 삭제하지 못했습니다.');
    } finally {
      setRemoving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', padding: '40px 32px', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={28} color="var(--color-neutral-400)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--color-neutral-900)' }}>로그인이 필요합니다</h2>
        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 28, lineHeight: 1.7, fontSize: 14 }}>
          장바구니 및 수강신청 기능은<br />로그인 후 이용할 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => nav('/courses')}>강의 둘러보기</Button>
          <Button onClick={() => nav('/login', { state: { from: '/cart' } })}>로그인하기</Button>
        </div>
      </div>
    );
  }

  if (user.role !== 'student') {
    const home = user.role === 'teacher' ? '/teacher' : '/admin';
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '40px 32px', textAlign: 'center', background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <ShoppingCart size={44} strokeWidth={1.2} color="var(--color-neutral-300)" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: 'var(--color-neutral-900)' }}>장바구니는 학생 전용입니다</h2>
        <p style={{ color: 'var(--color-neutral-500)', margin: '0 0 24px', fontSize: 14, lineHeight: 1.65 }}>
          강사·관리자 계정에서는 수강 신청·장바구니 기능을 사용할 수 없습니다.
        </p>
        <Button onClick={() => nav(home)}>내 강의실로</Button>
      </div>
    );
  }

  const loading = status === 'loading';
  const empty = !loading && (!items?.length);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>장바구니</h1>
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 14 }}>
          담아둔 강의를 선택한 뒤 나이스페이 샌드박스로 결제합니다. (테스트 환경 · 실제 과금 없음)
        </p>
      </div>

      {error && status === 'failed' && (
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
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void dispatch(fetchCart())}>
            다시 시도
          </Button>
        </div>
      )}

      {lastAction?.type === 'error' && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-100)',
            color: 'var(--color-warning-800)',
            fontSize: 13,
          }}
        >
          {lastAction.msg}
        </div>
      )}

      {loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-neutral-500)', fontSize: 14 }}>
          장바구니를 불러오는 중…
        </div>
      )}

      {!loading && empty && (
        <div style={{ textAlign: 'center', padding: '72px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ShoppingCart size={48} strokeWidth={1.2} color="var(--color-neutral-300)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-neutral-700)' }}>
            장바구니가 비어 있어요.
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: '0 0 24px' }}>
            관심 있는 강의를 담아 보세요.
          </p>
          <Link to="/courses"><Button variant="secondary">강의 둘러보기</Button></Link>
        </div>
      )}

      {!loading && !empty && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Button size="sm" variant="secondary" onClick={selectAll}>
                전체 선택
              </Button>
              <Button size="sm" variant="secondary" onClick={deselectAll}>
                전체 해제
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void removeSelected()}
                disabled={!selected.size || removing}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={14} />
                  선택 삭제
                </span>
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(items || []).map((i: { id: number; course_id: number; course_title: string; price: number }) => (
                <div
                  key={i.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    background: selected.has(i.course_id) ? 'var(--color-neutral-0)' : 'var(--color-neutral-50)',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: selected.has(i.course_id) ? 'var(--shadow-sm)' : 'none',
                    transition: 'background 150ms',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(i.course_id)}
                    onChange={() => toggle(i.course_id)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary-500)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/courses/${i.course_id}`}
                      style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-neutral-800)', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                    >
                      {i.course_title}
                    </Link>
                    <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {Number(i.price) === 0 ? <span style={{ color: 'var(--color-success-600)' }}>무료</span> : formatPrice(i.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void dispatch(removeFromCartThunk(i.course_id))}
                    aria-label="강의 삭제"
                    disabled={removing}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8,
                      border: 'none', background: 'transparent',
                      color: 'var(--color-neutral-400)', cursor: removing ? 'wait' : 'pointer', fontSize: 16,
                      transition: 'background 150ms, color 150ms', fontFamily: 'inherit',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!removing) {
                        e.currentTarget.style.background = 'var(--color-error-50)';
                        e.currentTarget.style.color = 'var(--color-error-600)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-neutral-400)';
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: 280,
              minWidth: 240,
              position: 'sticky',
              top: 'calc(var(--nav-h) + 16px)',
              padding: '20px',
              background: 'var(--color-neutral-0)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: 'var(--color-neutral-900)' }}>결제 요약</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--color-neutral-500)' }}>
              <span>선택한 강의</span>
              <span>{selected.size}개</span>
            </div>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '14px 0',
                borderTop: '1px solid var(--color-neutral-200)',
                marginTop: 8,
                fontSize: 18, fontWeight: 700,
                color: 'var(--color-neutral-900)',
              }}
            >
              <span>합계</span>
              <span>{total === 0 && selected.size ? '무료' : formatPrice(total)}</span>
            </div>
            <Button
              onClick={() => void checkout()}
              disabled={!selected.size || checkingOut}
              loading={checkingOut}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={16} />
                {total === 0 && selected.size ? '무료 수강신청' : '나이스페이로 결제'}
              </span>
            </Button>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--color-neutral-400)', lineHeight: 1.5 }}>
              샌드박스 테스트 카드로 결제하면 승인 API까지 실제로 호출되지만, 실제 돈은 나가지 않습니다.
              이미 수강 중인 강의는 결제 전에 장바구니에서 제거해 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
