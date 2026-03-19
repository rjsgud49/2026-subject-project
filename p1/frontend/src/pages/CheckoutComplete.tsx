import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import Button from '../components/Button';

export default function CheckoutComplete() {
  const ids = useAppSelector((s) => s.enrollment.checkoutCourseIds) as any[];

  return (
    <div style={{ maxWidth: 560, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>수강신청이 완료되었습니다</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>
        {ids?.length
          ? `${ids.length}개 강의가 내 강의실에 추가되었습니다. (P1 간이 결제·실결제 아님)`
          : '강의가 내 강의실에 반영되었습니다.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard">
          <Button style={{ padding: '14px 28px' }}>내 수업 보기</Button>
        </Link>
        <Link to="/courses">
          <Button variant="secondary" style={{ padding: '14px 28px' }}>
            강의 더 둘러보기
          </Button>
        </Link>
      </div>
    </div>
  );
}

