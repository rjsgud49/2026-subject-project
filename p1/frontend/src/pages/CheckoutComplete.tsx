import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import Button from '../components/Button';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutComplete() {
  const ids = useAppSelector((s) => s.enrollment.checkoutCourseIds) as any[];

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
          width: 64, height: 64,
          background: 'var(--color-success-50)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <CheckCircle2 size={36} color="var(--color-success-600)" />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: 'var(--color-neutral-900)' }}>
        수강신청이 완료되었습니다
      </h1>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: 32, fontSize: 14, lineHeight: 1.7 }}>
        {ids?.length
          ? `${ids.length}개 강의가 내 강의실에 추가되었습니다.`
          : '강의가 내 강의실에 반영되었습니다.'}
        <br />
        <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>(P1 간이 결제 · 실결제 아님)</span>
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard">
          <Button size="lg">내 강의실 보기</Button>
        </Link>
        <Link to="/courses">
          <Button variant="secondary" size="lg">강의 더 둘러보기</Button>
        </Link>
      </div>
    </div>
  );
}
