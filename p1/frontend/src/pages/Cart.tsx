import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchCart, removeFromCartThunk } from '../features/cartSlice';
import { enrollManyThunk, fetchEnrollments, setCheckoutCourseIds } from '../features/enrollmentSlice';
import Button from '../components/Button';
import { formatPrice } from '../utils/format';
import { Lock, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { items } = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.user.user);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);
  useEffect(() => { setSelected(new Set((items || []).map((i: any) => i.course_id))); }, [items]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const total = (items || [])
    .filter((i: any) => selected.has(i.course_id))
    .reduce((s: number, i: any) => s + Number(i.price || 0), 0);

  const checkout = async () => {
    const ids = [...selected];
    if (!ids.length) { window.alert('선택한 강의가 없습니다.'); return; }
    const r = await dispatch(enrollManyThunk(ids as any));
    if (r.error) { window.alert(r.error.message); return; }
    dispatch(setCheckoutCourseIds(ids as any));
    dispatch(fetchCart());
    dispatch(fetchEnrollments());
    nav('/checkout/complete');
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-neutral-900)' }}>장바구니</h1>
        <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 14 }}>선택한 강의를 한 번에 수강신청할 수 있습니다.</p>
      </div>

      {!items?.length ? (
        <div style={{ textAlign: 'center', padding: '72px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <ShoppingCart size={48} strokeWidth={1.2} color="var(--color-neutral-300)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-neutral-700)' }}>
            장바구니가 비어 있어요.
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: '0 0 24px' }}>
            마음에 드는 강의를 담아보세요.
          </p>
          <Link to="/courses"><Button variant="secondary">강의 둘러보기</Button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* 강의 목록 */}
          <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(items || []).map((i: any) => (
              <div
                key={i.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: selected.has(i.course_id) ? 'var(--color-neutral-0)' : 'var(--color-neutral-50)',
                  border: `1px solid ${selected.has(i.course_id) ? 'var(--color-neutral-200)' : 'var(--color-neutral-200)'}`,
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
                  onClick={() => dispatch(removeFromCartThunk(i.course_id))}
                  aria-label="강의 삭제"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 6,
                    border: 'none', background: 'transparent',
                    color: 'var(--color-neutral-400)', cursor: 'pointer', fontSize: 16,
                    transition: 'background 150ms, color 150ms', fontFamily: 'inherit',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-error-50)'; e.currentTarget.style.color = 'var(--color-error-600)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-neutral-400)'; }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* 결제 요약 */}
          <div
            style={{
              width: 260,
              minWidth: 220,
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
              onClick={checkout}
              disabled={!selected.size}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              수강신청하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
