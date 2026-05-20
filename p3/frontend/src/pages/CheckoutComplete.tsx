import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchEnrollments, setCheckoutCourseIds } from '../features/enrollmentSlice';
import { fetchCart } from '../features/cartSlice';
import Button from '../components/Button';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CheckoutComplete() {
  const dispatch = useAppDispatch();
  const [params] = useSearchParams();
  const storeIds = useAppSelector((s) => s.enrollment.checkoutCourseIds) as number[];

  const status = params.get('status');
  const isOk = status === 'ok' || (!status && storeIds?.length > 0);
  const isFail = status === 'fail';
  const orderId = params.get('orderId');
  const tid = params.get('tid');
  const sandbox = params.get('sandbox') === '1';
  const isFree = params.get('free') === '1';
  const failMsg = params.get('msg');

  const courseIds = useMemo(() => {
    const fromQuery = params.get('courseIds');
    if (fromQuery) {
      return fromQuery
        .split(',')
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0);
    }
    return Array.isArray(storeIds) ? storeIds : [];
  }, [params, storeIds]);

  useEffect(() => {
    if (courseIds.length) dispatch(setCheckoutCourseIds(courseIds));
    if (isOk) {
      dispatch(fetchEnrollments());
      dispatch(fetchCart());
    }
  }, [dispatch, courseIds, isOk]);

  const iconBg = isFail ? 'var(--color-error-50)' : 'var(--color-success-50)';
  const iconColor = isFail ? 'var(--color-error-600)' : 'var(--color-success-600)';

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: '48px 36px',
        textAlign: 'center',
        background: 'var(--color-neutral-0)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: iconBg,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        {isFail ? (
          <XCircle size={36} color={iconColor} />
        ) : (
          <CheckCircle2 size={36} color={iconColor} />
        )}
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: 'var(--color-neutral-900)' }}>
        {isFail ? '결제에 실패했습니다' : '결제 및 수강신청이 완료되었습니다'}
      </h1>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: 24, fontSize: 14, lineHeight: 1.7 }}>
        {isFail
          ? decodeURIComponent(failMsg || '결제가 취소되었거나 오류가 발생했습니다.')
          : courseIds.length
            ? `${courseIds.length}개 강의가 내 강의실에 추가되었습니다.`
            : '강의가 내 강의실에 반영되었습니다.'}
      </p>
      {(orderId || tid || sandbox || isFree) && (
        <div style={{ fontSize: 12, color: 'var(--color-neutral-400)', marginBottom: 24, lineHeight: 1.6 }}>
          {orderId && (
            <p style={{ margin: '0 0 6px' }}>
              주문번호: <code>{orderId}</code>
            </p>
          )}
          {tid && (
            <p style={{ margin: '0 0 6px' }}>
              거래번호: <code>{tid}</code>
            </p>
          )}
          {(sandbox || isFree) && (
            <p style={{ margin: 0 }}>
              {isFree ? '무료 수강신청' : '나이스페이 샌드박스 결제'} · 실제 과금 없음
            </p>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard">
          <Button size="lg">내 강의실 보기</Button>
        </Link>
        <Link to={isFail ? '/cart' : '/courses'}>
          <Button variant="secondary" size="lg">
            {isFail ? '장바구니로' : '강의 더 둘러보기'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
