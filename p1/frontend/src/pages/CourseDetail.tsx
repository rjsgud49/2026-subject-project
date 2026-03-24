import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchCourseDetail, setActiveTab } from '../features/coursesSlice';
import { addToCartThunk, fetchCart } from '../features/cartSlice';
import { enrollThunk, fetchEnrollments } from '../features/enrollmentSlice';
import { fetchQuestions } from '../features/qaSlice';
import Tabs from '../components/Tabs';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatPrice } from '../utils/format';

export default function CourseDetail() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { search } = useLocation();
  const dispatch = useAppDispatch();
  const [showCartModal, setShowCartModal] = useState(false);
  const { courseDetail, detailStatus, activeTab } = useAppSelector((s) => s.courses);
  const qa = useAppSelector((s) => s.qa.byCourse[Number(courseId)]);

  useEffect(() => {
    if (courseId) dispatch(fetchCourseDetail(courseId));
  }, [courseId, dispatch]);

  useEffect(() => {
    if (courseId) dispatch(fetchQuestions(Number(courseId)));
  }, [courseId, dispatch]);

  // ?tab=qa 쿼리 파라미터가 있으면 Q&A 탭 자동 활성화
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');
    if (tab === 'qa') dispatch(setActiveTab('qa'));
  }, [search, dispatch]);

  const addCart = async () => {
    const r = await dispatch(addToCartThunk(Number(courseId)));
    if (!r.error) {
      dispatch(fetchCart());
      setShowCartModal(true);
    } else window.alert(r.error.message);
  };

  const enroll = async () => {
    const r = await dispatch(enrollThunk(Number(courseId)));
    if (r.error) {
      window.alert(r.error.message || '수강신청에 실패했습니다.');
      return;
    }
    dispatch(fetchEnrollments());
    nav('/checkout/complete', { state: { single: true, courseId: Number(courseId) } });
  };

  if (detailStatus === 'loading' || !courseDetail) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        {detailStatus === 'failed' ? '강의를 찾을 수 없습니다.' : '불러오는 중…'}
      </div>
    );
  }

  const c: any = courseDetail;
  const tabs = [
    { id: 'intro', label: '소개' },
    { id: 'curriculum', label: '커리큘럼' },
    { id: 'qa', label: 'Q&A' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <p style={{ marginBottom: 16 }}>
        <Link to="/courses">← 강의 목록</Link>
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          marginBottom: 32,
          padding: 28,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            width: 360,
            maxWidth: '100%',
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
          }}
        >
          {c.thumbnail_url ? (
            <img
              src={c.thumbnail_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
            />
          ) : (
            '📚'
          )}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 14 }}>{c.category}</span>
          <h1 style={{ fontSize: 26, margin: '12px 0' }}>{c.title}</h1>
          <p style={{ color: 'var(--color-muted)' }}>
            {c.instructor_name} · {c.difficulty}
            {c.estimated_hours != null && ` · 약 ${c.estimated_hours}시간`}
          </p>
          <p style={{ fontSize: 24, fontWeight: 800, margin: '16px 0' }}>{formatPrice(c.price)}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={addCart}>
              장바구니 담기
            </Button>
            <Button onClick={enroll}>{Number(c.price) === 0 ? '무료 수강하기' : '수강신청(간이 결제)'}</Button>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={(id: any) => dispatch(setActiveTab(id))} />

      {activeTab === 'intro' && (
        <div style={{ maxWidth: 800 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>강의 소개</h2>
          <p style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.description || '상세 설명이 준비 중입니다.'}</p>
          <h2 style={{ fontSize: 18, margin: '32px 0 12px' }}>강사 소개</h2>
          <p style={{ color: 'var(--color-muted)' }}>{c.instructor_bio || `${c.instructor_name} 강사님의 강의입니다.`}</p>
        </div>
      )}

      {activeTab === 'curriculum' && <Accordion sections={c.sections || []} />}

      <Modal
        open={showCartModal}
        onClose={() => setShowCartModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCartModal(false)}>
              계속 쇼핑
            </Button>
            <Button
              onClick={() => {
                setShowCartModal(false);
                nav('/cart');
              }}
            >
              장바구니로 이동
            </Button>
          </>
        }
      >
        장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?
      </Modal>

      {activeTab === 'qa' && (
        <div>
          <Link to={`/courses/${courseId}/questions/new`}>
            <Button style={{ marginBottom: 20 }}>질문하기</Button>
          </Link>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(qa?.items || []).map((q: any) => (
              <li
                key={q.id}
                style={{
                  padding: 16,
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Link to={`/questions/${q.id}`} style={{ fontWeight: 600 }}>
                  {q.title}
                </Link>
                <span style={{ marginLeft: 12, fontSize: 14, color: 'var(--color-muted)' }}>
                  {q.user_name} · 답변 {q.answer_count}
                </span>
              </li>
            ))}
          </ul>
          {(!qa?.items || qa.items.length === 0) && <p style={{ color: 'var(--color-muted)' }}>아직 질문이 없습니다.</p>}
        </div>
      )}
    </div>
  );
}

