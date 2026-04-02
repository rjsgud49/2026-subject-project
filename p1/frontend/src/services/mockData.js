/** 오프라인·VITE_USE_MOCK=true 시 사용 */

const now = new Date().toISOString();

// ─── 공통 상수 ────────────────────────────────────────────────
const INTERVIEW_TYPES_LIST = ['기술면접', '인성면접', 'PT면접', '영어면접', '그룹면접'];

const JOB_FIELDS_LIST = [
  '웹/프론트엔드', '백엔드/서버', '알고리즘/자료구조', '데이터베이스', '시스템설계',
  'DevOps/클라우드', '데이터/AI', '모바일(Android/iOS)', '보안/네트워크', 'CS기초',
  '금융/은행', '마케팅/광고', '영업', '의료/간호', '공무원/공기업',
  '교육/강사', '디자인', '경영/기획', '법률/회계',
];

const IT_FIELDS = new Set([
  '웹/프론트엔드', '백엔드/서버', '알고리즘/자료구조', '데이터베이스', '시스템설계',
  'DevOps/클라우드', '데이터/AI', '모바일(Android/iOS)', '보안/네트워크', 'CS기초',
]);

// category가 면접방식명인 기존 강의 → interviewType으로 이동, category는 '경영/기획'으로 통일
const INTERVIEW_TYPE_CATS = new Set(['인성면접', 'PT면접', '영어면접', '그룹면접', '기술면접']);

function withMeta(c) {
  let interviewType = c.interviewType;
  let category = c.category;
  if (!interviewType) {
    if (INTERVIEW_TYPE_CATS.has(c.category)) {
      interviewType = c.category;
      category = '경영/기획'; // 범용 직무 카테고리로 통일
    } else if (IT_FIELDS.has(c.category)) {
      interviewType = '기술면접';
    } else {
      interviewType = '인성면접'; // 직무별 비IT 강의의 기본값
    }
  }
  return { ...c, category, interviewType, thumbnail_url: null, created_at: now };
}

// ─── 직접 제작 강의 (BASE) ────────────────────────────────────
const BASE_COURSES_RAW = [
  // ── 웹/프론트엔드 ──
  { id: 1,  title: 'React 기술면접 실전 대비', instructor_name: '김민준', category: '웹/프론트엔드', difficulty: '중급', price: 89000, estimated_hours: 12, description: 'React·Hooks·렌더링 최적화·상태 관리까지 기술면접 단골 질문을 실전 답변으로 정리합니다.' },
  { id: 2,  title: 'JavaScript 핵심 면접 질문 50선', instructor_name: '박서연', category: '웹/프론트엔드', difficulty: '초급', price: 49000, estimated_hours: 8,  description: '클로저·프로토타입·이벤트루프 등 JS 인터뷰 필수 개념을 Q&A 형식으로 정리합니다.' },
  { id: 3,  title: 'TypeScript 기술면접 완전 정복', instructor_name: '이준혁', category: '웹/프론트엔드', difficulty: '중급', price: 69000, estimated_hours: 10, description: '타입 시스템·제네릭·유틸리티 타입을 실전 면접 질문과 함께 심층 분석합니다.' },
  { id: 4,  title: 'Next.js 면접 대비 실전 가이드', instructor_name: '최수민', category: '웹/프론트엔드', difficulty: '고급', price: 99000, estimated_hours: 14, description: 'SSR/SSG/ISR 차이, App Router, 성능 최적화 전략 등 Next.js 면접 핵심을 다룹니다.' },
  { id: 5,  title: 'HTML/CSS 기술면접 기초 완성', instructor_name: '정다은', category: '웹/프론트엔드', difficulty: '초급', price: 0,     estimated_hours: 6,  description: 'Flex·Grid·시맨틱 마크업·접근성까지 프론트엔드 기초 면접을 완벽 대비합니다.' },
  { id: 6,  title: '프론트엔드 성능 최적화 인터뷰', instructor_name: '한지원', category: '웹/프론트엔드', difficulty: '고급', price: 119000, estimated_hours: 16, description: 'Core Web Vitals·번들 최적화·lazy loading 등 성능 면접 질문을 심층 해설합니다.' },
  // ── 백엔드/서버 ──
  { id: 7,  title: 'Node.js 이벤트 루프와 비동기 면접', instructor_name: '김민준', category: '백엔드/서버', difficulty: '중급', price: 59000, estimated_hours: 10, description: 'Node.js 이벤트 루프·Promise·async/await·비동기 패턴을 면접 관점으로 정리합니다.' },
  { id: 8,  title: 'Spring Boot 백엔드 기술면접 핵심', instructor_name: '오상현', category: '백엔드/서버', difficulty: '중급', price: 79000, estimated_hours: 12, description: 'IoC·AOP·스프링 컨테이너·JPA 연동을 실전 면접 시나리오로 학습합니다.' },
  { id: 9,  title: 'REST API 설계 원칙과 면접 대비', instructor_name: '박서연', category: '백엔드/서버', difficulty: '초급', price: 39000, estimated_hours: 7,  description: 'RESTful 설계 원칙·HTTP 메서드·상태코드·버저닝 전략을 체계적으로 정리합니다.' },
  { id: 10, title: '마이크로서비스 아키텍처 면접 완전 정복', instructor_name: '이준혁', category: '백엔드/서버', difficulty: '고급', price: 129000, estimated_hours: 18, description: 'MSA 설계 패턴·서비스 메시·분산 트랜잭션을 면접 질문과 함께 심층 분석합니다.' },
  { id: 11, title: 'Python 백엔드 면접 대비 (Django/FastAPI)', instructor_name: '윤지현', category: '백엔드/서버', difficulty: '중급', price: 69000, estimated_hours: 11, description: 'Django ORM·FastAPI 비동기·배포 전략 등 파이썬 백엔드 면접을 집중 공략합니다.' },
  { id: 12, title: 'Go 언어 백엔드 기술면접 핵심', instructor_name: '최수민', category: '백엔드/서버', difficulty: '고급', price: 89000, estimated_hours: 13, description: 'Goroutine·채널·인터페이스 등 Go 언어의 면접 핵심 개념을 완전 정복합니다.' },
  // ── 알고리즘/자료구조 ──
  { id: 13, title: '코딩테스트 기초 자료구조 완전 정복', instructor_name: '정다은', category: '알고리즘/자료구조', difficulty: '초급', price: 49000, estimated_hours: 9,  description: '배열·스택·큐·해시맵을 면접 단골 문제와 함께 기초부터 탄탄하게 다집니다.' },
  { id: 14, title: '정렬·탐색 알고리즘 면접 핵심', instructor_name: '한지원', category: '알고리즘/자료구조', difficulty: '중급', price: 59000, estimated_hours: 10, description: 'Quick/Merge Sort, BFS/DFS, 이진 탐색의 원리와 면접 답변 전략을 정리합니다.' },
  { id: 15, title: 'DP/그리디 알고리즘 면접 대비', instructor_name: '오상현', category: '알고리즘/자료구조', difficulty: '고급', price: 89000, estimated_hours: 15, description: '동적 프로그래밍과 그리디 알고리즘의 핵심 패턴을 면접 문제로 마스터합니다.' },
  { id: 16, title: '그래프·트리 알고리즘 실전 풀이', instructor_name: '윤지현', category: '알고리즘/자료구조', difficulty: '고급', price: 79000, estimated_hours: 12, description: '최단 경로·MST·위상 정렬·트리 순회 등 그래프 알고리즘 면접을 완전 정복합니다.' },
  { id: 17, title: '시간·공간 복잡도 분석 전략', instructor_name: '김민준', category: '알고리즘/자료구조', difficulty: '초급', price: 29000, estimated_hours: 5,  description: 'Big-O 표기법과 알고리즘 복잡도 분석 방법을 면접관 눈높이로 설명합니다.' },
  { id: 18, title: '코딩테스트 실전 모의고사 30회', instructor_name: '박서연', category: '알고리즘/자료구조', difficulty: '중급', price: 99000, estimated_hours: 20, description: '카카오·네이버·삼성 기출 유형 30개를 실시간 풀이 해설로 마스터합니다.' },
  // ── 데이터베이스 ──
  { id: 19, title: 'SQL 기술면접 핵심 정리', instructor_name: '이준혁', category: '데이터베이스', difficulty: '초급', price: 39000, estimated_hours: 7,  description: 'SELECT·JOIN·서브쿼리·집계함수를 면접 단골 문제와 함께 체계적으로 정리합니다.' },
  { id: 20, title: '인덱스·트랜잭션 DB 면접 완전 정복', instructor_name: '최수민', category: '데이터베이스', difficulty: '중급', price: 69000, estimated_hours: 10, description: 'B-Tree 인덱스·트랜잭션 격리 수준·MVCC를 면접 질문과 함께 심층 분석합니다.' },
  { id: 21, title: 'NoSQL vs RDBMS 면접 비교 분석', instructor_name: '정다은', category: '데이터베이스', difficulty: '중급', price: 59000, estimated_hours: 8,  description: 'MongoDB·Redis·Cassandra 등 NoSQL을 RDBMS와 비교하며 면접 답변을 구성합니다.' },
  { id: 22, title: '쿼리 최적화 실전 가이드', instructor_name: '한지원', category: '데이터베이스', difficulty: '고급', price: 89000, estimated_hours: 12, description: 'EXPLAIN 분석·실행 계획·파티셔닝 전략을 통해 쿼리 최적화 면접을 완전 대비합니다.' },
  { id: 23, title: '데이터 모델링 면접 대비', instructor_name: '오상현', category: '데이터베이스', difficulty: '중급', price: 49000, estimated_hours: 9,  description: 'ER 다이어그램·정규화·반정규화를 실무 시나리오와 함께 면접 관점으로 학습합니다.' },
  // ── 시스템설계 ──
  { id: 24, title: '대규모 서비스 설계 면접 입문', instructor_name: '윤지현', category: '시스템설계', difficulty: '중급', price: 79000, estimated_hours: 12, description: 'URL 단축기·채팅 시스템·뉴스피드 등 대표 설계 문제를 단계별로 풀어봅니다.' },
  { id: 25, title: '캐싱 전략과 설계 패턴 면접', instructor_name: '김민준', category: '시스템설계', difficulty: '중급', price: 59000, estimated_hours: 9,  description: 'Redis 캐싱·CDN·Cache-aside·Write-through 전략을 면접 관점으로 정리합니다.' },
  { id: 26, title: '로드밸런싱과 확장성 설계 면접', instructor_name: '박서연', category: '시스템설계', difficulty: '고급', price: 99000, estimated_hours: 14, description: 'L4/L7 로드밸런서·수평/수직 확장·Auto Scaling을 면접 시나리오로 학습합니다.' },
  { id: 27, title: 'DB 샤딩·복제 면접 심화', instructor_name: '이준혁', category: '시스템설계', difficulty: '고급', price: 119000, estimated_hours: 16, description: '데이터베이스 샤딩 전략·리플리케이션·일관성 모델을 면접 질문과 함께 분석합니다.' },
  { id: 28, title: '메시지 큐와 이벤트 드리븐 설계 면접', instructor_name: '최수민', category: '시스템설계', difficulty: '고급', price: 109000, estimated_hours: 15, description: 'Kafka·RabbitMQ·이벤트 소싱 패턴을 대규모 시스템 설계 면접에 적용하는 방법을 다룹니다.' },
  // ── DevOps/클라우드 ──
  { id: 29, title: 'AWS 클라우드 면접 핵심 정리', instructor_name: '정다은', category: 'DevOps/클라우드', difficulty: '중급', price: 79000, estimated_hours: 11, description: 'EC2·S3·RDS·Lambda·VPC 등 AWS 핵심 서비스를 면접 관점으로 완전 정리합니다.' },
  { id: 30, title: 'Docker/Kubernetes 면접 완전 정복', instructor_name: '한지원', category: 'DevOps/클라우드', difficulty: '고급', price: 119000, estimated_hours: 18, description: '컨테이너 원리·K8s 아키텍처·Pod/Service/Ingress를 면접 질문과 함께 마스터합니다.' },
  { id: 31, title: 'CI/CD 파이프라인 구축과 면접', instructor_name: '오상현', category: 'DevOps/클라우드', difficulty: '중급', price: 69000, estimated_hours: 10, description: 'GitHub Actions·Jenkins·ArgoCD로 CI/CD를 구성하고 면접 답변까지 한 번에 준비합니다.' },
  { id: 32, title: '리눅스 시스템 면접 완전 정복', instructor_name: '윤지현', category: 'DevOps/클라우드', difficulty: '중급', price: 49000, estimated_hours: 8,  description: '프로세스·파일시스템·네트워크 명령어·쉘 스크립트를 면접 출제 패턴으로 정리합니다.' },
  { id: 33, title: '클라우드 비용 최적화·아키텍처 면접', instructor_name: '김민준', category: 'DevOps/클라우드', difficulty: '고급', price: 99000, estimated_hours: 13, description: 'Well-Architected Framework·비용 최적화·보안 아키텍처를 면접 시나리오로 학습합니다.' },
  // ── 데이터/AI ──
  { id: 34, title: '머신러닝 기술면접 핵심 정리', instructor_name: '박서연', category: '데이터/AI', difficulty: '중급', price: 89000, estimated_hours: 13, description: '회귀·분류·클러스터링·과적합 방지 등 ML 면접 단골 질문을 체계적으로 정리합니다.' },
  { id: 35, title: '딥러닝 면접 질문 50선', instructor_name: '이준혁', category: '데이터/AI', difficulty: '고급', price: 129000, estimated_hours: 20, description: 'CNN·RNN·Transformer·역전파 알고리즘을 면접 질문과 함께 심층 분석합니다.' },
  { id: 36, title: '데이터 분석 SQL 면접 완전 정복', instructor_name: '최수민', category: '데이터/AI', difficulty: '초급', price: 49000, estimated_hours: 8,  description: '데이터 분석가 필수 SQL 패턴(Window Function·CTE·피벗)을 면접 관점으로 정리합니다.' },
  { id: 37, title: '통계·확률 기초 면접 대비', instructor_name: '정다은', category: '데이터/AI', difficulty: '초급', price: 39000, estimated_hours: 7,  description: 'A/B 테스트·가설 검정·확률 분포 등 데이터 직군 면접 필수 통계를 쉽게 풀이합니다.' },
  { id: 38, title: '데이터 엔지니어링 면접 실전', instructor_name: '한지원', category: '데이터/AI', difficulty: '고급', price: 109000, estimated_hours: 16, description: 'Spark·Airflow·데이터 파이프라인 설계·ETL 아키텍처를 면접 관점으로 심층 분석합니다.' },
  // ── 모바일(Android/iOS) ──
  { id: 39, title: 'Android 기술면접 핵심 정리', instructor_name: '오상현', category: '모바일(Android/iOS)', difficulty: '중급', price: 79000, estimated_hours: 12, description: 'Activity/Fragment 생명주기·Jetpack Compose·Room DB를 면접 질문으로 완전 정복합니다.' },
  { id: 40, title: 'iOS Swift 면접 대비 실전', instructor_name: '윤지현', category: '모바일(Android/iOS)', difficulty: '중급', price: 89000, estimated_hours: 13, description: 'Swift 옵셔널·ARC·Combine·SwiftUI를 면접 시나리오와 함께 심층 분석합니다.' },
  { id: 41, title: 'React Native 크로스플랫폼 면접', instructor_name: '김민준', category: '모바일(Android/iOS)', difficulty: '중급', price: 69000, estimated_hours: 10, description: 'React Native 아키텍처·Bridge·Native Modules를 면접 관점으로 완전 정리합니다.' },
  { id: 42, title: '모바일 앱 성능 최적화 면접', instructor_name: '박서연', category: '모바일(Android/iOS)', difficulty: '고급', price: 99000, estimated_hours: 14, description: '배터리·메모리·렌더링 최적화와 앱 성능 측정 도구를 면접 답변으로 구성합니다.' },
  { id: 43, title: '앱 아키텍처 패턴 면접 (MVVM/MVI)', instructor_name: '이준혁', category: '모바일(Android/iOS)', difficulty: '고급', price: 109000, estimated_hours: 15, description: 'MVVM·MVI·Clean Architecture를 모바일 면접에서 설득력 있게 설명하는 법을 다룹니다.' },
  // ── 보안/네트워크 ──
  { id: 44, title: '네트워크 TCP/IP 기술면접 핵심', instructor_name: '최수민', category: '보안/네트워크', difficulty: '초급', price: 39000, estimated_hours: 7,  description: 'OSI 7계층·TCP/IP·3-way handshake·DNS를 면접 단골 질문으로 완전 정리합니다.' },
  { id: 45, title: 'HTTP/HTTPS 웹 보안 면접', instructor_name: '정다은', category: '보안/네트워크', difficulty: '중급', price: 59000, estimated_hours: 9,  description: 'HTTPS·TLS·쿠키/세션·CORS·CSRF/XSS 방어를 면접 관점으로 심층 분석합니다.' },
  { id: 46, title: '정보보안 취약점 대응 면접', instructor_name: '한지원', category: '보안/네트워크', difficulty: '고급', price: 99000, estimated_hours: 14, description: 'OWASP Top 10·침투 테스트·보안 감사를 실무 시나리오와 함께 면접 대비합니다.' },
  { id: 47, title: 'OAuth·JWT 인증 보안 면접', instructor_name: '오상현', category: '보안/네트워크', difficulty: '중급', price: 69000, estimated_hours: 10, description: 'OAuth 2.0 플로우·JWT 구조·토큰 갱신·보안 취약점을 면접 질문으로 완전 정리합니다.' },
  { id: 48, title: '방화벽·VPN 인프라 보안 면접', instructor_name: '윤지현', category: '보안/네트워크', difficulty: '고급', price: 89000, estimated_hours: 12, description: '방화벽 정책·VPN 프로토콜·제로 트러스트 보안 모델을 면접 시나리오로 학습합니다.' },
  // ── CS기초 ──
  { id: 49, title: '운영체제 기술면접 핵심 정리', instructor_name: '김민준', category: 'CS기초', difficulty: '중급', price: 59000, estimated_hours: 10, description: '프로세스·스레드·스케줄링·메모리 관리·교착상태를 면접 질문으로 완전 정복합니다.' },
  { id: 50, title: '컴퓨터 구조 면접 완전 정복', instructor_name: '박서연', category: 'CS기초', difficulty: '중급', price: 49000, estimated_hours: 9,  description: 'CPU 파이프라인·캐시 메모리·명령어 세트·인터럽트를 면접 관점으로 정리합니다.' },
  { id: 51, title: '멀티스레딩·동시성 면접 심화', instructor_name: '이준혁', category: 'CS기초', difficulty: '고급', price: 89000, estimated_hours: 13, description: '뮤텍스·세마포어·Race Condition·Lock-Free 자료구조를 면접 질문과 함께 분석합니다.' },
  { id: 52, title: '메모리 구조와 가상화 면접', instructor_name: '최수민', category: 'CS기초', difficulty: '고급', price: 79000, estimated_hours: 11, description: '가상 메모리·페이징·세그멘테이션·TLB를 면접 시나리오로 심층 학습합니다.' },
  { id: 53, title: 'CS기초 통합 면접 벼락치기 30일', instructor_name: '정다은', category: 'CS기초', difficulty: '초급', price: 0, estimated_hours: 15, description: '자료구조·OS·네트워크·DB 핵심을 30일 커리큘럼으로 빠르게 정리하는 CS 입문 총정리.' },
  // ── 인성면접 (→ category: 경영/기획 으로 통합됨) ──
  { id: 54, title: '인성면접 답변 구조화 STAR 기법', instructor_name: '이서연', category: '인성면접', difficulty: '초급', price: 0,     estimated_hours: 5,  description: 'STAR 기법으로 경험 기반 답변을 구조화하고 설득력 있는 스토리라인을 완성합니다.' },
  { id: 55, title: '1분 자기소개 완성 클래스', instructor_name: '강지호', category: '인성면접', difficulty: '초급', price: 29000, estimated_hours: 4,  description: '직무 적합성을 어필하는 30초·1분·3분 자기소개 템플릿을 완성합니다.' },
  { id: 56, title: '갈등 상황 대처법 면접 실전', instructor_name: '남궁민', category: '인성면접', difficulty: '중급', price: 49000, estimated_hours: 7,  description: '조직 내 갈등·실패 경험·압박 질문을 전략적으로 대응하는 방법을 훈련합니다.' },
  { id: 57, title: '성장·실패 경험 스토리텔링', instructor_name: '이서연', category: '인성면접', difficulty: '초급', price: 39000, estimated_hours: 6,  description: '성장 스토리와 실패 경험을 임팩트 있게 정리하여 면접관을 설득하는 기술을 배웁니다.' },
  { id: 58, title: '직장인 태도·가치관 면접 전략', instructor_name: '강지호', category: '인성면접', difficulty: '중급', price: 59000, estimated_hours: 8,  description: '직업 가치관·팀워크·리더십 경험을 구체적 사례와 함께 답변하는 전략을 완성합니다.' },
  { id: 59, title: '면접 합격을 부르는 이력서 작성법', instructor_name: '남궁민', category: '인성면접', difficulty: '중급', price: 49000, estimated_hours: 6,  description: '문장 다듬기·프로젝트 임팩트 정리·포트폴리오 구성까지 이력서 완성 클래스.' },
  // ── PT면접 ──
  { id: 60, title: 'PT 면접 10분 스피치 마스터', instructor_name: '박준형', category: 'PT면접', difficulty: '고급', price: 129000, estimated_hours: 14, description: '10분 PT를 위한 구조(문제-원인-해결-효과)와 발표 전달력을 실전 훈련합니다.' },
  { id: 61, title: '문서 기반 PT 구성 전략', instructor_name: '이서연', category: 'PT면접', difficulty: '중급', price: 79000, estimated_hours: 10, description: '주어진 자료를 빠르게 분석하고 논리적인 PT 구조를 5분 안에 완성하는 전략을 다룹니다.' },
  { id: 62, title: 'PT 자료 준비와 발표 기술', instructor_name: '강지호', category: 'PT면접', difficulty: '초급', price: 49000, estimated_hours: 7,  description: 'PT 슬라이드 구성·핵심 메시지 전달·시각 보조자료 활용 방법을 처음부터 배웁니다.' },
  { id: 63, title: '케이스 PT 실전 풀이 20문제', instructor_name: '박준형', category: 'PT면접', difficulty: '고급', price: 109000, estimated_hours: 16, description: '대기업·컨설팅·공기업 실제 PT 기출 20문제를 단계별로 풀어보며 완전 정복합니다.' },
  { id: 64, title: '비대면 화상 PT 면접 완전 대비', instructor_name: '남궁민', category: 'PT면접', difficulty: '중급', price: 59000, estimated_hours: 8,  description: '화상 면접 환경 세팅·시선 처리·음성 전달력을 비대면 PT에 맞게 최적화합니다.' },
  // ── 영어면접 ──
  { id: 65, title: '영어면접 필수 표현 100', instructor_name: '임유진', category: '영어면접', difficulty: '초급', price: 39000, estimated_hours: 7,  description: '자기소개·경력·프로젝트 설명에 꼭 필요한 영어 표현 100개를 상황별로 정리합니다.' },
  { id: 66, title: 'Tell me about yourself 완전 정복', instructor_name: '임유진', category: '영어면접', difficulty: '초급', price: 0,     estimated_hours: 4,  description: '영어 1분 자기소개부터 직무 연계 스토리까지 단계별로 완성하는 집중 클래스.' },
  { id: 67, title: '외국계 기업 영어면접 전략', instructor_name: '이서연', category: '영어면접', difficulty: '중급', price: 89000, estimated_hours: 12, description: '외국계 기업이 선호하는 답변 구조·문화 적합성 어필·영어 압박 질문 대응법을 학습합니다.' },
  { id: 68, title: '비즈니스 영어 면접 표현 마스터', instructor_name: '임유진', category: '영어면접', difficulty: '중급', price: 69000, estimated_hours: 10, description: 'Behavioral Question·Situational Question에 답하는 비즈니스 영어 표현을 마스터합니다.' },
  { id: 69, title: '영어 기술 PT 발표 실전', instructor_name: '강지호', category: '영어면접', difficulty: '고급', price: 99000, estimated_hours: 13, description: '영어로 기술 프레젠테이션·제안·토론하는 방법을 면접 시나리오와 함께 훈련합니다.' },
  // ── 그룹면접 ──
  { id: 70, title: '그룹 토론 면접 완전 정복', instructor_name: '남궁민', category: '그룹면접', difficulty: '중급', price: 59000, estimated_hours: 9,  description: '찬반 토론·자유 토의·사례 토론 유형별 전략과 존재감 드러내는 발언법을 훈련합니다.' },
  { id: 71, title: '그룹 PT 협업 전략', instructor_name: '박준형', category: '그룹면접', difficulty: '중급', price: 69000, estimated_hours: 10, description: '역할 분담·의견 조율·합의 도출 과정을 면접관이 선호하는 방식으로 보여주는 전략을 배웁니다.' },
  { id: 72, title: '그룹면접 관찰자 시선 사로잡기', instructor_name: '이서연', category: '그룹면접', difficulty: '고급', price: 89000, estimated_hours: 12, description: '발언하지 않을 때도 평가받는다! 경청·리액션·비언어적 표현으로 존재감을 높이는 전략.' },
  { id: 73, title: '토의형 면접 설득력 향상', instructor_name: '강지호', category: '그룹면접', difficulty: '초급', price: 39000, estimated_hours: 6,  description: '논리적 주장 구성·반론 대응·공감대 형성 등 설득 커뮤니케이션 기초를 다집니다.' },
  { id: 74, title: '그룹면접 합격 사례 20선 분석', instructor_name: '남궁민', category: '그룹면접', difficulty: '중급', price: 49000, estimated_hours: 7,  description: '실제 대기업·공기업 그룹면접 합격자 20명의 사례를 분석하여 패턴을 도출합니다.' },
  // ── 금융/은행 ──
  { id: 75, title: '은행권 기술·직무 면접 핵심', instructor_name: '홍성민', category: '금융/은행', difficulty: '중급', price: 79000, estimated_hours: 12, description: '시중은행·지방은행·인터넷전문은행 직무 면접을 역할별로 체계적으로 대비합니다.' },
  { id: 76, title: '금융공기업 NCS 기반 면접 전략', instructor_name: '서지수', category: '금융/은행', difficulty: '초급', price: 49000, estimated_hours: 8,  description: '금융감독원·산업은행·수출입은행 NCS 직무역량 면접을 단계별로 대비합니다.' },
  { id: 77, title: '투자은행(IB) 면접 전략', instructor_name: '홍성민', category: '금융/은행', difficulty: '고급', price: 129000, estimated_hours: 16, description: '증권사·투자은행 Investment Banking 부서 면접에서 요구하는 재무 지식과 케이스를 다룹니다.' },
  { id: 78, title: '보험·증권 직무 면접 완전 정복', instructor_name: '서지수', category: '금융/은행', difficulty: '중급', price: 69000, estimated_hours: 10, description: '생명보험·손해보험·증권사 직무별 면접 유형과 자주 나오는 질문을 완전 정리합니다.' },
  { id: 79, title: '핀테크 기업 면접 가이드', instructor_name: '홍성민', category: '금융/은행', difficulty: '중급', price: 59000, estimated_hours: 9,  description: '카카오페이·토스·카뱅 등 핀테크 기업이 원하는 인재상과 면접 전략을 분석합니다.' },
  // ── 마케팅/광고 ──
  { id: 80, title: '디지털 마케팅 면접 핵심 정리', instructor_name: '서지수', category: '마케팅/광고', difficulty: '초급', price: 39000, estimated_hours: 7,  description: 'SEO·SEM·SNS 마케팅·퍼포먼스 지표를 마케팅 직군 면접 관점으로 완전 정리합니다.' },
  { id: 81, title: '브랜드 매니저 면접 전략', instructor_name: '임유진', category: '마케팅/광고', difficulty: '중급', price: 69000, estimated_hours: 10, description: '브랜드 포지셔닝·IMC 전략·소비자 인사이트를 면접 사례와 함께 학습합니다.' },
  { id: 82, title: '콘텐츠 마케팅 포트폴리오 면접', instructor_name: '강지호', category: '마케팅/광고', difficulty: '중급', price: 59000, estimated_hours: 8,  description: '유튜브·인스타그램·블로그 콘텐츠 전략을 포트폴리오와 함께 면접에서 어필하는 법을 배웁니다.' },
  { id: 83, title: '퍼포먼스 마케팅 기술 면접', instructor_name: '서지수', category: '마케팅/광고', difficulty: '고급', price: 89000, estimated_hours: 13, description: 'CPC·ROAS·LTV·A/B 테스트를 퍼포먼스 마케터 면접에서 설득력 있게 설명하는 법을 다룹니다.' },
  { id: 84, title: '광고대행사 AE 면접 완전 정복', instructor_name: '임유진', category: '마케팅/광고', difficulty: '중급', price: 79000, estimated_hours: 11, description: '광고주 대응·캠페인 기획·미디어 믹스 전략을 AE 면접 시나리오로 실전 훈련합니다.' },
  // ── 영업 ──
  { id: 85, title: 'B2B 영업직 면접 핵심 전략', instructor_name: '남궁민', category: '영업', difficulty: '중급', price: 59000, estimated_hours: 9,  description: '법인 영업·솔루션 세일즈·제안서 작성을 면접 스토리로 구성하는 전략을 학습합니다.' },
  { id: 86, title: '세일즈 실적 어필 자기소개 전략', instructor_name: '박준형', category: '영업', difficulty: '초급', price: 39000, estimated_hours: 6,  description: '영업 수치·고객 확보 사례를 설득력 있게 포장하여 면접관에게 임팩트를 주는 방법을 다룹니다.' },
  { id: 87, title: '고객 응대·CRM 면접 대비', instructor_name: '이서연', category: '영업', difficulty: '초급', price: 29000, estimated_hours: 5,  description: '고객 관리·클레임 대응·CS 시스템 활용 경험을 면접 답변으로 구조화합니다.' },
  { id: 88, title: '유통·리테일 영업 면접 전략', instructor_name: '홍성민', category: '영업', difficulty: '중급', price: 49000, estimated_hours: 7,  description: '대형마트·편의점·온라인 유통 채널 영업 직무의 면접을 완전 대비합니다.' },
  { id: 89, title: '해외 영업직 면접 완전 정복', instructor_name: '임유진', category: '영업', difficulty: '고급', price: 99000, estimated_hours: 13, description: '글로벌 시장 분석·바이어 협상·무역 실무를 해외영업 면접 시나리오로 학습합니다.' },
  // ── 의료/간호 ──
  { id: 90, title: '간호사 취업 면접 핵심 전략', instructor_name: '서지수', category: '의료/간호', difficulty: '초급', price: 49000, estimated_hours: 8,  description: '대학병원·종합병원·요양원 등 병원 유형별 간호사 면접을 역할별로 완전 대비합니다.' },
  { id: 91, title: '병원 의료기사 면접 완전 정복', instructor_name: '홍성민', category: '의료/간호', difficulty: '중급', price: 59000, estimated_hours: 9,  description: '임상병리사·방사선사·물리치료사·작업치료사 직무별 면접 유형과 답변 전략을 정리합니다.' },
  { id: 92, title: '약사 채용 면접 전략', instructor_name: '서지수', category: '의료/간호', difficulty: '중급', price: 69000, estimated_hours: 10, description: '약국·병원·제약회사·CRO 약사 직무별 면접 질문과 경력 기반 답변법을 학습합니다.' },
  { id: 93, title: '의료기기 영업·마케팅 면접', instructor_name: '홍성민', category: '의료/간호', difficulty: '중급', price: 79000, estimated_hours: 11, description: '의료기기 영업 특성·제품 지식·병원 영업 전략을 면접 관점으로 심층 분석합니다.' },
  { id: 94, title: '보건직 공무원 면접 대비', instructor_name: '서지수', category: '의료/간호', difficulty: '초급', price: 39000, estimated_hours: 6,  description: '보건직 9급 공무원·보건소·공공의료기관 직무 면접을 완전 대비합니다.' },
  // ── 공무원/공기업 ──
  { id: 95, title: '9급 공무원 면접 합격 전략', instructor_name: '강지호', category: '공무원/공기업', difficulty: '초급', price: 49000, estimated_hours: 8,  description: '국가직·지방직 9급 공무원 면접의 평가 기준과 자주 나오는 질문을 완전 정복합니다.' },
  { id: 96, title: '공기업 NCS 직무역량 면접', instructor_name: '남궁민', category: '공무원/공기업', difficulty: '중급', price: 69000, estimated_hours: 10, description: '한전·코레일·LH 등 주요 공기업 NCS 기반 직무역량 면접을 유형별로 완전 대비합니다.' },
  { id: 97, title: '공기업 PT 면접 완전 대비', instructor_name: '박준형', category: '공무원/공기업', difficulty: '중급', price: 79000, estimated_hours: 11, description: '공기업 PT 면접 기출문제를 분석하고 10분 발표와 Q&A를 실전 훈련합니다.' },
  { id: 98, title: '국가직 면접 기출 완전 분석', instructor_name: '강지호', category: '공무원/공기업', difficulty: '고급', price: 99000, estimated_hours: 14, description: '5년간 국가직 면접 기출 문제를 유형별로 분석하고 고득점 답변 전략을 제시합니다.' },
  { id: 99, title: '지방직 공무원 면접 실전', instructor_name: '이서연', category: '공무원/공기업', difficulty: '초급', price: 0,     estimated_hours: 6,  description: '지역별 특색을 반영한 지방직 공무원 면접 대비와 자기소개·지원동기 완성 클래스.' },
  // ── 교육/강사 ──
  { id: 100, title: '교원 임용 면접 핵심 전략', instructor_name: '임유진', category: '교육/강사', difficulty: '중급', price: 79000, estimated_hours: 12, description: '2차 임용 심층 면접·수업 실연·교직 적성 면접을 단계별로 완전 대비합니다.' },
  { id: 101, title: '기업 HRD 강사 채용 면접', instructor_name: '강지호', category: '교육/강사', difficulty: '중급', price: 59000, estimated_hours: 9,  description: '기업 연수원·HRD 팀 강사 채용 면접에서 교수 설계 역량과 퍼실리테이션 기술을 어필합니다.' },
  { id: 102, title: '학원 강사 면접 합격 비법', instructor_name: '남궁민', category: '교육/강사', difficulty: '초급', price: 39000, estimated_hours: 6,  description: '학원 시범 강의·교육 철학·학생 관리 능력을 면접에서 임팩트 있게 보여주는 전략을 다룹니다.' },
  { id: 103, title: '코딩 교육 강사 면접 대비', instructor_name: '박서연', category: '교육/강사', difficulty: '중급', price: 49000, estimated_hours: 7,  description: '초중고 코딩 교육·SW 교육 강사 채용 면접에서 교육 역량과 기술 지식을 균형 있게 어필합니다.' },
  { id: 104, title: '평생교육사 취업 면접 가이드', instructor_name: '임유진', category: '교육/강사', difficulty: '초급', price: 29000, estimated_hours: 5,  description: '평생교육관·복지관·기업 교육팀 평생교육사 채용 면접을 직무별로 완전 대비합니다.' },
  // ── 디자인 ──
  { id: 105, title: 'UX/UI 디자이너 포트폴리오 면접', instructor_name: '서지수', category: '디자인', difficulty: '중급', price: 89000, estimated_hours: 13, description: 'UX 리서치·와이어프레임·프로토타입을 면접에서 설득력 있게 설명하는 포트폴리오 전략을 배웁니다.' },
  { id: 106, title: '그래픽 디자인 면접 전략', instructor_name: '홍성민', category: '디자인', difficulty: '초급', price: 49000, estimated_hours: 7,  description: '브랜드 아이덴티티·인쇄물·편집 디자인 포트폴리오를 면접에서 임팩트 있게 발표하는 법을 다룹니다.' },
  { id: 107, title: '브랜드 디자이너 취업 면접', instructor_name: '서지수', category: '디자인', difficulty: '중급', price: 69000, estimated_hours: 10, description: '브랜드 전략·로고·BI 디자인 경험을 면접 스토리로 구성하는 완전 정복 클래스.' },
  { id: 108, title: '영상·모션 디자인 면접 대비', instructor_name: '임유진', category: '디자인', difficulty: '중급', price: 79000, estimated_hours: 11, description: 'After Effects·Premiere Pro 기반 모션 포트폴리오를 영상 직군 면접에 효과적으로 어필합니다.' },
  { id: 109, title: '제품 디자인 직무 면접 완전 정복', instructor_name: '홍성민', category: '디자인', difficulty: '고급', price: 109000, estimated_hours: 15, description: '산업 디자인·제품 기획·프로토타이핑 역량을 기업 제품 디자이너 면접 시나리오로 학습합니다.' },
  // ── 경영/기획 ──
  { id: 110, title: '경영기획 직무 면접 완전 정복', instructor_name: '강지호', category: '경영/기획', difficulty: '중급', price: 79000, estimated_hours: 12, description: '전략 수립·예산 기획·KPI 관리 경험을 경영기획 면접에서 임팩트 있게 어필합니다.' },
  { id: 111, title: '전략 컨설턴트 케이스 인터뷰', instructor_name: '남궁민', category: '경영/기획', difficulty: '고급', price: 149000, estimated_hours: 20, description: '4대 컨설팅 펌 케이스 인터뷰 20문제를 MECE·이슈트리·수치 추정으로 완전 정복합니다.' },
  { id: 112, title: 'PM/PO 프로덕트 매니저 면접', instructor_name: '박서연', category: '경영/기획', difficulty: '고급', price: 119000, estimated_hours: 16, description: '제품 기획·로드맵·지표 분석·우선순위 결정을 IT기업 PM/PO 면접 시나리오로 학습합니다.' },
  { id: 113, title: '신사업 기획 직무 면접 전략', instructor_name: '강지호', category: '경영/기획', difficulty: '중급', price: 69000, estimated_hours: 10, description: '시장 조사·비즈니스 모델 캔버스·사업 타당성 분석을 면접에서 설득력 있게 발표합니다.' },
  { id: 114, title: 'IR 발표·스타트업 면접 전략', instructor_name: '남궁민', category: '경영/기획', difficulty: '고급', price: 99000, estimated_hours: 14, description: '투자자 대상 IR 발표와 스타트업 전략기획 면접을 실전 시나리오로 완전 대비합니다.' },
  // ── 법률/회계 ──
  { id: 115, title: '법무팀 인하우스 변호사 면접', instructor_name: '서지수', category: '법률/회계', difficulty: '고급', price: 129000, estimated_hours: 16, description: '계약 검토·분쟁 대응·규제 준수를 기업 법무팀 채용 면접 시나리오로 완전 대비합니다.' },
  { id: 116, title: '세무사·회계사 취업 면접 전략', instructor_name: '홍성민', category: '법률/회계', difficulty: '중급', price: 79000, estimated_hours: 11, description: '회계법인·세무법인 취업을 위한 실무 면접 준비와 전문직 커리어 설계 전략을 다룹니다.' },
  { id: 117, title: '준법감시·컴플라이언스 면접', instructor_name: '서지수', category: '법률/회계', difficulty: '고급', price: 109000, estimated_hours: 14, description: '금융·제조·IT 기업 컴플라이언스 부서 채용 면접을 규정 해석·리스크 관리 관점으로 대비합니다.' },
  { id: 118, title: '회계·재무 직무 면접 완전 정복', instructor_name: '홍성민', category: '법률/회계', difficulty: '중급', price: 69000, estimated_hours: 10, description: '재무제표 분석·원가 회계·예산 관리 경험을 회계·재무 직군 면접 시나리오로 학습합니다.' },
  { id: 119, title: '계약 관리·법무 직무 면접', instructor_name: '서지수', category: '법률/회계', difficulty: '중급', price: 59000, estimated_hours: 9,  description: '계약서 검토·협상 경험·법무 문서 작성 역량을 면접에서 임팩트 있게 어필하는 전략을 다룹니다.' },
].map(withMeta);

// ─── 이중 필터 커버리지 생성기 ────────────────────────────────
// 5가지 면접방식 × 19가지 직무/분야 = 95조합 × 2강의 = 190개 생성
function generateComboCourses(startId) {
  const INSTRUCTORS = ['김민준', '박서연', '이준혁', '최수민', '정다은', '한지원', '오상현', '윤지현', '이서연', '강지호', '박준형', '임유진', '남궁민', '홍성민', '서지수'];
  const PRICES     = [29000, 39000, 49000, 59000, 69000, 79000, 89000, 99000, 109000, 119000];
  const DIFFS      = ['초급', '중급', '고급'];
  const HOURS      = [6, 7, 8, 9, 10, 11, 12, 13, 14];

  const DESC = {
    '기술면접': (jf) => `${jf} 직군에서 자주 출제되는 기술면접 핵심 질문과 실전 답변 전략을 체계적으로 완전 정복합니다.`,
    '인성면접': (jf) => `${jf} 직무 지원자를 위한 인성면접 핵심 질문과 STAR 기법 기반 답변 전략을 단계별로 완성합니다.`,
    'PT면접':   (jf) => `${jf} 직무 PT면접에서 자주 출제되는 주제를 구조적으로 발표하고 Q&A까지 대비하는 전략을 훈련합니다.`,
    '영어면접': (jf) => `${jf} 직군 영어면접에서 자주 나오는 표현과 답변 구조를 실전 시나리오로 완전 마스터합니다.`,
    '그룹면접': (jf) => `${jf} 직군 그룹면접에서 존재감을 발휘하고 팀워크·협업 역량을 어필하는 전략을 완전 정복합니다.`,
  };

  const courses = [];
  let id = startId;
  let idx = 0;

  for (const itype of INTERVIEW_TYPES_LIST) {
    for (const jfield of JOB_FIELDS_LIST) {
      const inst1 = INSTRUCTORS[idx % INSTRUCTORS.length];
      const inst2 = INSTRUCTORS[(idx + 5) % INSTRUCTORS.length];

      // 강의 1: 핵심 정리
      courses.push({
        id: id++,
        title: `[${itype}] ${jfield} 핵심 정리`,
        instructor_name: inst1,
        category: jfield,
        interviewType: itype,
        difficulty: DIFFS[idx % 3],
        price: PRICES[idx % PRICES.length],
        estimated_hours: HOURS[idx % HOURS.length],
        description: DESC[itype](jfield),
        thumbnail_url: null,
        created_at: now,
      });

      // 강의 2: 실전 대비
      courses.push({
        id: id++,
        title: `[${itype}] ${jfield} 실전 대비`,
        instructor_name: inst2,
        category: jfield,
        interviewType: itype,
        difficulty: DIFFS[(idx + 1) % 3],
        price: PRICES[(idx + 3) % PRICES.length],
        estimated_hours: HOURS[(idx + 2) % HOURS.length],
        description: `${jfield} 직무 ${itype}에서 합격한 선배들의 답변 패턴을 분석하고 나만의 전략을 완성하는 실전 훈련 과정입니다.`,
        thumbnail_url: null,
        created_at: now,
      });

      idx++;
    }
  }
  return courses;
}

// 전체 강의: BASE(119개) + 조합 생성(190개) = 309개
const COMBO_COURSES = generateComboCourses(200);
const ALL_COURSES   = [...BASE_COURSES_RAW, ...COMBO_COURSES];

// ─── 목록 API (카테고리·면접방식·난이도·가격·키워드·페이징) ──
export function getMockCoursesList(queryString = '') {
  const params     = new URLSearchParams(queryString.replace(/^\?/, ''));
  const q           = (params.get('q')            || '').toLowerCase();
  const category    = params.get('category')       || ''; // 직무/분야
  const interviewType = params.get('interviewType') || ''; // 면접 방식
  const difficulty  = params.get('difficulty')     || '';
  const minPrice    = params.get('min_price') ? Number(params.get('min_price')) : null;
  const maxPrice    = params.get('max_price') ? Number(params.get('max_price')) : null;
  const freeOnly    = params.get('freeOnly') === 'true';
  const sort        = params.get('sort') || 'latest';
  const page        = Math.max(1, Number(params.get('page') || 1));
  const size        = Math.max(1, Number(params.get('size') || 12));

  let result = [...ALL_COURSES];

  // 두 필터 모두 서버 측에서 처리 → 페이지네이션 전 적용
  if (category)     result = result.filter((c) => c.category      === category);
  if (interviewType) result = result.filter((c) => c.interviewType === interviewType);
  if (difficulty)   result = result.filter((c) => c.difficulty    === difficulty);
  if (freeOnly)     result = result.filter((c) => c.price         === 0);
  if (minPrice != null) result = result.filter((c) => c.price >= minPrice);
  if (maxPrice != null) result = result.filter((c) => c.price <= maxPrice);
  if (q) result = result.filter(
    (c) => c.title.toLowerCase().includes(q)
        || c.description.toLowerCase().includes(q)
        || c.instructor_name.toLowerCase().includes(q),
  );

  if (sort === 'price_asc')  result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else result.sort((a, b) => b.id - a.id); // latest / popular: 높은 id 우선

  const total = result.length;
  const items = result.slice((page - 1) * size, page * size);
  return { items, total, page, size };
}

export const MOCK_COURSES_LIST = getMockCoursesList();

// ─── 상세 API ─────────────────────────────────────────────────
const buildDetail = (c) => ({
  ...c,
  instructor_bio: `${c.instructor_name} 강사. 현업 실무 경험 기반의 면접 전략 전문가.`,
  sections: [
    {
      id: c.id * 10 + 1,
      title: '1. 핵심 개념 정리',
      videos: [
        { id: c.id * 100 + 1, title: '강의 소개 및 커리큘럼 안내',  duration_seconds: 300, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: c.id * 100 + 2, title: '자주 나오는 면접 질문 TOP 10', duration_seconds: 600, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: c.id * 100 + 3, title: '답변 구조 만들기 전략',         duration_seconds: 540, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      ],
    },
    {
      id: c.id * 10 + 2,
      title: '2. 실전 대비 훈련',
      videos: [
        { id: c.id * 100 + 4, title: '모의 면접 Q&A 세션 1',          duration_seconds: 720, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: c.id * 100 + 5, title: '모의 면접 Q&A 세션 2',          duration_seconds: 720, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: c.id * 100 + 6, title: '합격자 답변 분석 및 피드백',     duration_seconds: 900, video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      ],
    },
  ],
});

export const MOCK_COURSE_DETAIL = buildDetail(ALL_COURSES[0]);

// ─── 상태 ─────────────────────────────────────────────────────
export let mockCart        = [];
export let mockEnrollments = [];
const mockQuestionById     = {};
let mockQuestionId         = 100;

export function mockReset() {
  mockCart = [];
  mockEnrollments = [];
  Object.keys(mockQuestionById).forEach((k) => delete mockQuestionById[k]);
  mockQuestionId = 100;
}

// ─── 핸들러 ───────────────────────────────────────────────────
export function mockHandleRequest(method, path, body, userId) {
  const json = typeof body === 'string' && body ? JSON.parse(body) : body || {};

  if (path === '/courses' || path.startsWith('/courses?')) {
    const qs = path.includes('?') ? path.split('?')[1] : '';
    return Promise.resolve(getMockCoursesList(qs));
  }

  const courseMatch = path.match(/^\/courses\/(\d+)$/);
  if (courseMatch && method === 'GET') {
    const id  = Number(courseMatch[1]);
    const found = ALL_COURSES.find((c) => c.id === id);
    if (found) return Promise.resolve(buildDetail(found));
    return Promise.resolve({ ...buildDetail(ALL_COURSES[0]), id, title: `샘플 강의 #${id}`, price: id * 1000 });
  }

  if (path === '/cart' && method === 'GET') return Promise.resolve([...mockCart]);
  if (path === '/cart' && method === 'POST') {
    const cid = json.course_id;
    if (mockCart.some((x) => x.course_id === cid)) return Promise.reject(new Error('이미 장바구니에 있습니다.'));
    const course = ALL_COURSES.find((c) => c.id === cid);
    mockCart.push({ id: mockCart.length + 1, course_id: cid, course_title: course?.title || `강의 ${cid}`, price: course?.price ?? 0 });
    return Promise.resolve({});
  }
  const delCart = path.match(/^\/cart\/(\d+)$/);
  if (delCart && method === 'DELETE') { mockCart = mockCart.filter((x) => x.course_id !== Number(delCart[1])); return Promise.resolve(undefined); }

  if ((path === '/enrollments' || path.startsWith('/enrollments?')) && method === 'GET') return Promise.resolve([...mockEnrollments]);
  if (path === '/enrollments' && method === 'POST') {
    const cid = json.course_id;
    if (mockEnrollments.some((e) => e.course_id === cid)) return Promise.reject(new Error('이미 수강 중입니다.'));
    const course = ALL_COURSES.find((c) => c.id === cid);
    const enr = { id: mockEnrollments.length + 1, course_id: cid, course_title: course?.title || `강의 ${cid}`, thumbnail_url: null, progress_percent: 0, status: 'active', last_video_id: null, last_second: 0 };
    mockEnrollments.push(enr);
    mockCart = mockCart.filter((x) => x.course_id !== cid);
    return Promise.resolve({ id: enr.id });
  }
  const enrMatch = path.match(/^\/enrollments\/(\d+)$/);
  if (enrMatch && method === 'GET') {
    const eid = Number(enrMatch[1]);
    const enr = mockEnrollments.find((e) => e.id === eid);
    if (!enr) return Promise.reject(new Error('Not found'));
    const course = ALL_COURSES.find((c) => c.id === enr.course_id);
    return Promise.resolve({ ...enr, course: course ? buildDetail(course) : { ...buildDetail(ALL_COURSES[0]), id: enr.course_id, title: enr.course_title }, last_video_id: enr.last_video_id });
  }
  const progMatch = path.match(/^\/enrollments\/(\d+)\/progress$/);
  if (progMatch && method === 'GET') return Promise.resolve([]);
  const updProg = path.match(/^\/enrollments\/(\d+)\/videos\/(\d+)\/progress$/);
  if (updProg && method === 'PUT') return Promise.resolve(undefined);

  const qList = path.match(/^\/courses\/(\d+)\/questions/);
  if (qList && method === 'GET') {
    const cid = Number(qList[1]);
    const items = Object.values(mockQuestionById).filter((x) => x.question.course_id === cid).map((x) => ({ id: x.question.id, title: x.question.title, user_name: x.question.user_name, answer_count: x.answers.length, created_at: x.question.created_at }));
    return Promise.resolve({ items, total: items.length });
  }
  const qCreate = path.match(/^\/courses\/(\d+)\/questions$/);
  if (qCreate && method === 'POST') {
    const cid = Number(qCreate[1]);
    const id  = ++mockQuestionId;
    const q   = { id, course_id: cid, title: json.title, body: json.body, user_id: userId, user_name: '나', created_at: new Date().toISOString() };
    mockQuestionById[id] = { question: q, answers: [] };
    return Promise.resolve(q);
  }
  const qGet = path.match(/^\/questions\/(\d+)$/);
  if (qGet && method === 'GET') {
    const qid = Number(qGet[1]);
    const row = mockQuestionById[qid];
    if (!row) return Promise.reject(new Error('Not found'));
    return Promise.resolve({ question: { ...row.question }, answers: row.answers });
  }
  if (qGet && method === 'PUT') {
    const qid = Number(qGet[1]);
    const row = mockQuestionById[qid];
    if (!row) return Promise.reject(new Error('Not found'));
    if (row.question.user_id !== userId) return Promise.reject(new Error('Forbidden'));
    if (json.title) row.question.title = json.title;
    if (json.body)  row.question.body  = json.body;
    return Promise.resolve({});
  }
  if (qGet && method === 'DELETE') {
    const qid = Number(qGet[1]);
    const row = mockQuestionById[qid];
    if (!row) return Promise.reject(new Error('Not found'));
    if (row.question.user_id !== userId) return Promise.reject(new Error('Forbidden'));
    delete mockQuestionById[qid];
    return Promise.resolve(undefined);
  }
  const ans = path.match(/^\/questions\/(\d+)\/answers$/);
  if (ans && method === 'POST') {
    const qid = Number(ans[1]);
    const row = mockQuestionById[qid];
    if (row) row.answers.push({ id: row.answers.length + 1, body: json.body, user_name: '답변자', created_at: new Date().toISOString() });
    return Promise.resolve({});
  }

  return Promise.reject(new Error(`Mock: unhandled ${method} ${path}`));
}
