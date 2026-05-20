import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="public-page">
      <section className="hero">
        <h1>역할 기반 인강 LMS</h1>
        <p className="lead">
          관리자·강사·학생 역할을 분리하고, JWT로 보호된 API와 화면 플로우를 제공합니다. (Project 2)
        </p>
        {!user && (
          <div className="hero-actions">
            <Link to="/login" className="btn primary">
              로그인
            </Link>
            <Link to="/signup" className="btn secondary">
              학생으로 가입
            </Link>
          </div>
        )}
      </section>

      <section className="card-grid">
        <h2 className="section-title">데모 계정 (시드 후 사용)</h2>
        <p className="muted" style={{ marginTop: -8, marginBottom: 20 }}>
          백엔드에서 <code>npm run seed</code> 실행 시 아래 계정이 생성됩니다. 비밀번호는 카드에 표시된 대로 입력하세요.
        </p>
        <div className="demo-cards">
          <article className="card demo">
            <h3>관리자</h3>
            <p className="mono">admin@p2.local</p>
            <p className="muted small">비밀번호: admin123</p>
            <p className="small">회원 역할 변경, 통계, 전체 강의 조회</p>
          </article>
          <article className="card demo">
            <h3>강사</h3>
            <p className="mono">teacher@p2.local</p>
            <p className="muted small">비밀번호: teacher123</p>
            <p className="small">강의 CRUD, 공개 여부, 프로필(소개) 수정</p>
          </article>
          <article className="card demo">
            <h3>학생</h3>
            <p className="mono">student@p2.local</p>
            <p className="muted small">비밀번호: student123</p>
            <p className="small">공개 강의 탐색, 수강 신청·취소</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <span>P2 — README 기준 역할분리·인증 구현</span>
      </footer>
    </div>
  );
}
