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
import DOMPurify from 'dompurify';

export default function CourseDetail() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { search } = useLocation();
  const dispatch = useAppDispatch();
  const [showCartModal, setShowCartModal] = useState(false);
  const { courseDetail, detailStatus, activeTab } = useAppSelector((s) => s.courses);
  const user = useAppSelector((s) => s.user.user);
  const canUseStudentPurchase = !user || user.role === 'student';
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

  const requireLogin = () => {
    nav('/login', { state: { from: `/courses/${courseId}` } });
  };

  const addCart = async () => {
    if (!user) { requireLogin(); return; }
    const r = await dispatch(addToCartThunk(Number(courseId)));
    if (!r.error) {
      dispatch(fetchCart());
      setShowCartModal(true);
    } else window.alert(r.error.message);
  };

  const enroll = async () => {
    if (!user) { requireLogin(); return; }
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
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 24px' }}>
        {detailStatus === 'failed' ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-neutral-500)' }}>
            강의를 찾을 수 없습니다.
          </div>
        ) : (
          <div>
            <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 24, borderRadius: 6 }} />
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 36, padding: 28, background: 'var(--color-neutral-0)', borderRadius: 12, border: '1px solid var(--color-neutral-200)' }}>
              <div className="skeleton" style={{ width: 320, aspectRatio: '16/9', borderRadius: 10 }} />
              <div style={{ flex: 1, minWidth: 260 }}>
                <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 12, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 28, width: '90%', marginBottom: 10, borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 14, width: 160, marginBottom: 16, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 6 }} />
              </div>
            </div>
          </div>
        )}
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
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 24px' }}>
      {/* 브레드크럼 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
        <Link to="/courses" style={{ color: 'var(--color-neutral-600)' }}>강의</Link>
        <span style={{ color: 'var(--color-neutral-400)', fontSize: 12 }}>›</span>
        <span style={{ color: 'var(--color-neutral-500)' }} aria-current="page">{c.title}</span>
      </div>

      {/* 강의 요약 카드 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          marginBottom: 36,
          padding: '28px',
          background: 'var(--color-neutral-0)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* 썸네일 */}
        <div
          style={{
            width: 320, maxWidth: '100%', aspectRatio: '16/9',
            background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56, flexShrink: 0, overflow: 'hidden',
          }}
        >
          {c.thumbnail_url
            ? <img src={c.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
            : '📚'
          }
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {c.category && (
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                {c.category}
              </span>
            )}
            {c.difficulty && (
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-600)', background: 'var(--color-neutral-100)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
                {c.difficulty === 'beginner' ? '입문' : c.difficulty === 'intermediate' ? '중급' : '고급'}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>{c.title}</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-500)' }}>
            {c.instructor_name}
            {c.estimated_hours != null && ` · 약 ${c.estimated_hours}시간`}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, margin: '8px 0 0', color: 'var(--color-neutral-900)' }}>
            {Number(c.price) === 0 ? <span style={{ color: 'var(--color-success-600)' }}>무료</span> : formatPrice(c.price)}
          </p>

          {user && !canUseStudentPurchase ? (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--color-neutral-500)', lineHeight: 1.55 }}>
              강사·관리자 계정에서는 장바구니·수강신청을 사용할 수 없습니다.{' '}
              {user.role === 'teacher' && (
                <Link to="/teacher/courses" style={{ fontWeight: 600 }}>
                  내 강의 관리
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/courses" style={{ fontWeight: 600 }}>
                  전체 강의
                </Link>
              )}
            </p>
          ) : user ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <Button variant="secondary" onClick={addCart}>장바구니 담기</Button>
              <Button onClick={enroll}>{Number(c.price) === 0 ? '무료 수강하기' : '수강신청하기'}</Button>
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              <div style={{ marginBottom: 10, padding: '10px 14px', background: 'var(--color-warning-50)', border: '1px solid var(--color-warning-100)', borderRadius: 8, fontSize: 13, color: 'var(--color-warning-700)' }}>
                🔒 수강신청은 로그인 후 이용할 수 있습니다.
              </div>
              <Button onClick={requireLogin}>로그인하고 수강신청하기</Button>
            </div>
          )}
        </div>
      </div>

      {/* 탭 */}
      <Tabs tabs={tabs} active={activeTab} onChange={(id: any) => dispatch(setActiveTab(id))} />

      {activeTab === 'intro' && (
        <div style={{ maxWidth: 720 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--color-neutral-900)' }}>강의 소개</h2>
          <p style={{ lineHeight: 1.8, color: 'var(--color-neutral-700)', whiteSpace: 'pre-wrap', fontSize: 15 }}>
            {c.description || '상세 설명이 준비 중입니다.'}
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '32px 0 12px', color: 'var(--color-neutral-900)' }}>강사 소개</h2>
          {c.instructor_profile_html ? (
            <div
              className="instructor-rich"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.instructor_profile_html) }}
            />
          ) : (
            <p style={{ color: 'var(--color-neutral-500)', fontSize: 14, lineHeight: 1.7 }}>
              {c.instructor_bio || `${c.instructor_name} 강사님의 강의입니다.`}
            </p>
          )}
        </div>
      )}

      {activeTab === 'curriculum' && <Accordion sections={c.sections || []} />}

      <Modal
        open={showCartModal}
        onClose={() => setShowCartModal(false)}
        title="장바구니에 담겼습니다"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCartModal(false)}>계속 둘러보기</Button>
            <Button onClick={() => { setShowCartModal(false); nav('/cart'); }}>장바구니로 이동</Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-600)' }}>장바구니로 이동하시겠습니까?</p>
      </Modal>

      {activeTab === 'qa' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Link to={`/courses/${courseId}/questions/new`}>
              <Button>질문하기</Button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(qa?.items || []).map((q: any) => (
              <div
                key={q.id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--color-neutral-0)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}
              >
                <Link to={`/questions/${q.id}`} style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-neutral-800)', flex: 1 }}>
                  {q.title}
                </Link>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', flexShrink: 0 }}>
                  {q.user_name} · 답변 {q.answer_count}
                </span>
              </div>
            ))}
          </div>
          {(!qa?.items || qa.items.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-500)', fontSize: 14 }}>
              아직 질문이 없어요. 첫 질문을 남겨보세요!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

