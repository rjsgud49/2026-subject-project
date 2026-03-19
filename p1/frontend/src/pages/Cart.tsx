import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchCart, removeFromCartThunk } from '../features/cartSlice';
import { enrollManyThunk, fetchEnrollments, setCheckoutCourseIds } from '../features/enrollmentSlice';
import Button from '../components/Button';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { items } = useAppSelector((s) => s.cart);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    setSelected(new Set((items || []).map((i: any) => i.course_id)));
  }, [items]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const total = (items || [])
    .filter((i: any) => selected.has(i.course_id))
    .reduce((s: number, i: any) => s + Number(i.price || 0), 0);

  const checkout = async () => {
    const ids = [...selected];
    if (!ids.length) {
      window.alert('선택한 강의가 없습니다.');
      return;
    }
    const r = await dispatch(enrollManyThunk(ids as any));
    if (r.error) {
      window.alert(r.error.message);
      return;
    }
    dispatch(setCheckoutCourseIds(ids as any));
    dispatch(fetchCart());
    dispatch(fetchEnrollments());
    nav('/checkout/complete');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>장바구니</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>선택한 강의를 한 번에 수강신청(간이 결제)할 수 있습니다.</p>

      {!items?.length ? (
        <p style={{ textAlign: 'center', padding: 48 }}>
          장바구니가 비어 있습니다. <Link to="/courses">강의 둘러보기</Link>
        </p>
      ) : (
        <>
          {(items || []).map((i: any) => (
            <div
              key={i.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <input type="checkbox" checked={selected.has(i.course_id)} onChange={() => toggle(i.course_id)} />
              <div style={{ flex: 1 }}>
                <Link to={`/courses/${i.course_id}`} style={{ fontWeight: 600 }}>
                  {i.course_title}
                </Link>
                <p style={{ margin: 4, color: 'var(--color-muted)' }}>{formatPrice(i.price)}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => dispatch(removeFromCartThunk(i.course_id))}>
                삭제
              </Button>
            </div>
          ))}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: 'var(--color-surface)',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              선택 합계: {total === 0 && selected.size ? formatPrice(0) : formatPrice(total)}
              {selected.size === 0 && ' (선택 없음)'}
            </p>
            <Button onClick={checkout} disabled={!selected.size}>
              선택 상품 수강신청(간이 결제)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

