/**
 * 시드 실행: npx ts-node -r tsconfig-paths/register src/seed.ts
 * (또는 npm run build 후 node dist/seed.js)
 * DB 연결 후 데모 데이터(강의/섹션/영상/장바구니/수강/진도/Q&A) 생성
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';
import { CourseSection } from './entities/course-section.entity';
import { CourseVideo } from './entities/course-video.entity';
import { CartItem } from './entities/cart-item.entity';
import { Enrollment } from './entities/enrollment.entity';
import { VideoProgress } from './entities/video-progress.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import * as bcrypt from 'bcryptjs';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'p1_interview',
  entities: [
    User,
    Course,
    CourseSection,
    CourseVideo,
    CartItem,
    Enrollment,
    VideoProgress,
    Question,
    Answer,
  ],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const courseRepo = dataSource.getRepository(Course);
  const sectionRepo = dataSource.getRepository(CourseSection);
  const videoRepo = dataSource.getRepository(CourseVideo);
  const cartRepo = dataSource.getRepository(CartItem);
  const enrollRepo = dataSource.getRepository(Enrollment);
  const progressRepo = dataSource.getRepository(VideoProgress);
  const questionRepo = dataSource.getRepository(Question);
  const answerRepo = dataSource.getRepository(Answer);

  const ensureUserId1 = async (fallback: { name: string; email: string; role: string }) => {
    let u = await userRepo.findOne({ where: { id: 1 } });
    if (u) return u;
    try {
      await userRepo.insert({ id: 1 as any, ...fallback });
      u = await userRepo.findOne({ where: { id: 1 } });
      if (u) return u;
    } catch {
      // ignore (identity 설정/이미 존재 등)
    }
    // 마지막 수단: 생성 (테이블이 비어 있으면 id=1이 될 가능성이 큼)
    u = userRepo.create(fallback);
    await userRepo.save(u);
    return u;
  };

  const DEFAULT_STUDENT_PASSWORD = 'p1pass1234';
  const DEFAULT_INSTRUCTOR_PASSWORD = 'teach1234';

  const student = await ensureUserId1({
    name: '학습자',
    email: 'student@p1.local',
    role: 'student',
  });

  // 기본 계정 비밀번호 설정 (이미 있으면 유지)
  if (!student.passwordHash) {
    student.passwordHash = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10);
    await userRepo.save(student);
  }

  // id=1을 수동으로 넣은 경우, identity 시퀀스가 1에 머무르며 다음 insert가 id=1로 충돌할 수 있음.
  // 현재 테이블의 max(id)로 시퀀스를 맞춰둔다.
  await dataSource.query(
    `SELECT setval(pg_get_serial_sequence('users','id'), (SELECT COALESCE(MAX(id), 1) FROM users))`,
  );

  const INSTRUCTOR_BIO =
    'IT·면접 코칭 경력 10년 이상. 대형 테크 기업 시니어 엔지니어 출신으로, 기술·인성·PT 면접까지 실전 중심으로 지도합니다. 수강생 합격 후기 다수.';

  let instructor = await userRepo.findOne({ where: { email: 'instructor@p1.local' } });
  if (!instructor) {
    instructor = userRepo.create({
      name: '김민준',
      email: 'instructor@p1.local',
      role: 'instructor',
      bio: INSTRUCTOR_BIO,
    });
    await userRepo.save(instructor);
  }
  if (instructor) {
    let changed = false;
    if (!instructor.passwordHash) {
      instructor.passwordHash = await bcrypt.hash(DEFAULT_INSTRUCTOR_PASSWORD, 10);
      changed = true;
    }
    if (!instructor.bio) {
      instructor.bio = INSTRUCTOR_BIO;
      changed = true;
    }
    if (changed) await userRepo.save(instructor);
  }

  const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

  type CourseSeed = {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    price: string;
    sections: Array<{ title: string; videos: Array<{ title: string; durationSeconds: number }> }>;
  };

  const s = (videos: Array<{ title: string; durationSeconds: number }>, sectionTitle: string) => ({
    title: sectionTitle,
    videos,
  });
  const v = (title: string, durationSeconds = 600) => ({ title, durationSeconds });

  const courseSeeds: CourseSeed[] = [
    // ── 웹/프론트엔드 ──
    { title: 'React 기술면접 실전 대비', description: 'React·Hooks·렌더링 최적화·상태 관리까지 기술면접 단골 질문을 실전 답변으로 정리합니다.', category: '웹/프론트엔드', difficulty: '중급', price: '89000', sections: [s([v('Virtual DOM과 Reconciliation'), v('Hooks useState/useEffect', 900)], '1. React 핵심'), s([v('memo/useMemo/useCallback', 780), v('리렌더링 디버깅 전략', 720)], '2. 성능 최적화')] },
    { title: 'JavaScript 핵심 면접 질문 50선', description: '클로저·프로토타입·이벤트루프 등 JS 인터뷰 필수 개념을 Q&A 형식으로 정리합니다.', category: '웹/프론트엔드', difficulty: '초급', price: '49000', sections: [s([v('클로저와 스코프', 480), v('프로토타입 체인', 540)], '1. 핵심 개념'), s([v('이벤트루프와 비동기', 600), v('this 바인딩 완전 정복', 540)], '2. 심화')] },
    { title: 'TypeScript 기술면접 완전 정복', description: '타입 시스템·제네릭·유틸리티 타입을 실전 면접 질문과 함께 심층 분석합니다.', category: '웹/프론트엔드', difficulty: '중급', price: '69000', sections: [s([v('타입 vs 인터페이스', 540), v('제네릭 활용 전략', 600)], '1. 타입 시스템'), s([v('유틸리티 타입 완전 정복', 660), v('실전 Q&A', 720)], '2. 심화 질문')] },
    { title: 'Next.js 면접 대비 실전 가이드', description: 'SSR/SSG/ISR 차이, App Router, 성능 최적화 전략 등 Next.js 면접 핵심을 다룹니다.', category: '웹/프론트엔드', difficulty: '고급', price: '99000', sections: [s([v('SSR/SSG/ISR 비교', 720), v('App Router vs Pages Router', 660)], '1. Next.js 아키텍처'), s([v('이미지·폰트 최적화', 600), v('실전 면접 Q&A', 840)], '2. 성능과 배포')] },
    { title: 'HTML/CSS 기술면접 기초 완성', description: 'Flex·Grid·시맨틱 마크업·접근성까지 프론트엔드 기초 면접을 완벽 대비합니다.', category: '웹/프론트엔드', difficulty: '초급', price: '0', sections: [s([v('Flexbox 완전 정복', 420), v('CSS Grid 레이아웃', 480)], '1. 레이아웃'), s([v('시맨틱 HTML과 접근성', 540), v('CSS 애니메이션 면접', 480)], '2. 심화')] },
    { title: '프론트엔드 성능 최적화 인터뷰', description: 'Core Web Vitals·번들 최적화·lazy loading 등 성능 면접 질문을 심층 해설합니다.', category: '웹/프론트엔드', difficulty: '고급', price: '119000', sections: [s([v('Core Web Vitals 분석', 720), v('번들 사이즈 최적화', 660)], '1. 성능 지표'), s([v('Lazy Loading & Code Splitting', 600), v('성능 측정 도구 활용', 540)], '2. 실전 적용')] },

    // ── 백엔드/서버 ──
    { title: 'Node.js 이벤트 루프와 비동기 면접', description: 'Node.js 이벤트 루프·Promise·async/await·비동기 패턴을 면접 관점으로 정리합니다.', category: '백엔드/서버', difficulty: '중급', price: '59000', sections: [s([v('이벤트 루프 동작 원리', 540), v('Promise vs async/await', 600)], '1. 비동기 처리'), s([v('스트림과 버퍼', 480), v('클러스터링 전략', 540)], '2. 고급 개념')] },
    { title: 'Spring Boot 백엔드 기술면접 핵심', description: 'IoC·AOP·스프링 컨테이너·JPA 연동을 실전 면접 시나리오로 학습합니다.', category: '백엔드/서버', difficulty: '중급', price: '79000', sections: [s([v('IoC와 DI 완전 정복', 660), v('AOP 프록시 원리', 600)], '1. Spring 핵심'), s([v('JPA N+1 문제 해결', 720), v('트랜잭션 관리 전략', 660)], '2. 데이터 접근')] },
    { title: 'REST API 설계 원칙과 면접 대비', description: 'RESTful 설계 원칙·HTTP 메서드·상태코드·버저닝 전략을 체계적으로 정리합니다.', category: '백엔드/서버', difficulty: '초급', price: '39000', sections: [s([v('REST 6원칙 이해', 420), v('HTTP 메서드와 상태코드', 480)], '1. REST 기본'), s([v('API 버저닝 전략', 540), v('페이지네이션 설계', 480)], '2. 실전 설계')] },
    { title: '마이크로서비스 아키텍처 면접 완전 정복', description: 'MSA 설계 패턴·서비스 메시·분산 트랜잭션을 면접 질문과 함께 심층 분석합니다.', category: '백엔드/서버', difficulty: '고급', price: '129000', sections: [s([v('모놀리스 vs MSA 트레이드오프', 720), v('서비스 디스커버리와 메시', 780)], '1. MSA 아키텍처'), s([v('Saga 패턴 분산 트랜잭션', 840), v('MSA 면접 실전 Q&A', 900)], '2. 분산 시스템')] },
    { title: 'Python 백엔드 면접 대비 (Django/FastAPI)', description: 'Django ORM·FastAPI 비동기·배포 전략 등 파이썬 백엔드 면접을 집중 공략합니다.', category: '백엔드/서버', difficulty: '중급', price: '69000', sections: [s([v('Django ORM 심화', 600), v('FastAPI 비동기 처리', 660)], '1. 파이썬 웹 프레임워크'), s([v('Celery 작업 큐 면접', 540), v('Docker 배포 전략', 600)], '2. 배포와 운영')] },
    { title: 'Go 언어 백엔드 기술면접 핵심', description: 'Goroutine·채널·인터페이스 등 Go 언어의 면접 핵심 개념을 완전 정복합니다.', category: '백엔드/서버', difficulty: '고급', price: '89000', sections: [s([v('Goroutine과 채널', 720), v('인터페이스와 덕 타이핑', 660)], '1. Go 언어 특성'), s([v('메모리 관리와 GC', 600), v('실전 백엔드 패턴', 720)], '2. 실전 활용')] },

    // ── 알고리즘/자료구조 ──
    { title: '코딩테스트 기초 자료구조 완전 정복', description: '배열·스택·큐·해시맵을 면접 단골 문제와 함께 기초부터 탄탄하게 다집니다.', category: '알고리즘/자료구조', difficulty: '초급', price: '49000', sections: [s([v('배열과 연결 리스트', 480), v('스택과 큐 구현', 540)], '1. 기본 자료구조'), s([v('해시맵 충돌 처리', 600), v('힙과 우선순위 큐', 540)], '2. 응용 자료구조')] },
    { title: '정렬·탐색 알고리즘 면접 핵심', description: 'Quick/Merge Sort, BFS/DFS, 이진 탐색의 원리와 면접 답변 전략을 정리합니다.', category: '알고리즘/자료구조', difficulty: '중급', price: '59000', sections: [s([v('퀵정렬 vs 병합정렬', 600), v('이진 탐색 완전 정복', 540)], '1. 정렬과 탐색'), s([v('BFS/DFS 면접 답변 전략', 660), v('탐색 복잡도 분석', 480)], '2. 그래프 탐색')] },
    { title: 'DP/그리디 알고리즘 면접 대비', description: '동적 프로그래밍과 그리디 알고리즘의 핵심 패턴을 면접 문제로 마스터합니다.', category: '알고리즘/자료구조', difficulty: '고급', price: '89000', sections: [s([v('DP 점화식 세우는 법', 720), v('배낭 문제 완전 정복', 780)], '1. 동적 프로그래밍'), s([v('그리디 증명 전략', 660), v('DP vs 그리디 선택 기준', 600)], '2. 그리디')] },
    { title: '그래프·트리 알고리즘 실전 풀이', description: '최단 경로·MST·위상 정렬·트리 순회 등 그래프 알고리즘 면접을 완전 정복합니다.', category: '알고리즘/자료구조', difficulty: '고급', price: '79000', sections: [s([v('다익스트라·벨만포드', 780), v('크루스칼·프림 MST', 720)], '1. 그래프 알고리즘'), s([v('위상 정렬과 사이클 검출', 660), v('트리 DP 심화', 720)], '2. 트리 심화')] },
    { title: '시간·공간 복잡도 분석 전략', description: 'Big-O 표기법과 알고리즘 복잡도 분석 방법을 면접관 눈높이로 설명합니다.', category: '알고리즘/자료구조', difficulty: '초급', price: '29000', sections: [s([v('Big-O 표기법 완전 이해', 360), v('공간 복잡도 계산법', 420)], '1. 복잡도 기초'), s([v('면접에서 복잡도 말하기', 480)], '2. 면접 적용')] },
    { title: '코딩테스트 실전 모의고사 30회', description: '카카오·네이버·삼성 기출 유형 30개를 실시간 풀이 해설로 마스터합니다.', category: '알고리즘/자료구조', difficulty: '중급', price: '99000', sections: [s([v('카카오 기출 유형 분석', 720), v('네이버 코딩테스트 패턴', 660)], '1. 기업별 기출'), s([v('삼성 SW 역량 테스트 전략', 780), v('30문제 실전 모의고사', 1200)], '2. 실전 훈련')] },

    // ── 데이터베이스 ──
    { title: 'SQL 기술면접 핵심 정리', description: 'SELECT·JOIN·서브쿼리·집계함수를 면접 단골 문제와 함께 체계적으로 정리합니다.', category: '데이터베이스', difficulty: '초급', price: '39000', sections: [s([v('JOIN 완전 정복', 480), v('서브쿼리 vs 조인', 540)], '1. SQL 기본'), s([v('Window Function 면접 활용', 600), v('GROUP BY 심화', 480)], '2. 집계와 분석')] },
    { title: '인덱스·트랜잭션 DB 면접 완전 정복', description: 'B-Tree 인덱스·트랜잭션 격리 수준·MVCC를 면접 질문과 함께 심층 분석합니다.', category: '데이터베이스', difficulty: '중급', price: '69000', sections: [s([v('B-Tree 인덱스 구조', 660), v('복합 인덱스 최적화', 600)], '1. 인덱스'), s([v('트랜잭션 ACID 속성', 600), v('격리 수준 4단계', 720)], '2. 트랜잭션')] },
    { title: 'NoSQL vs RDBMS 면접 비교 분석', description: 'MongoDB·Redis·Cassandra 등 NoSQL을 RDBMS와 비교하며 면접 답변을 구성합니다.', category: '데이터베이스', difficulty: '중급', price: '59000', sections: [s([v('CAP 정리 완전 이해', 600), v('MongoDB 도큐먼트 모델링', 660)], '1. NoSQL 특성'), s([v('Redis 캐싱 전략', 540), v('언제 NoSQL을 쓸까', 600)], '2. 선택 기준')] },
    { title: '쿼리 최적화 실전 가이드', description: 'EXPLAIN 분석·실행 계획·파티셔닝 전략을 통해 쿼리 최적화 면접을 완전 대비합니다.', category: '데이터베이스', difficulty: '고급', price: '89000', sections: [s([v('EXPLAIN 실행 계획 읽기', 720), v('슬로우 쿼리 분석', 660)], '1. 쿼리 분석'), s([v('테이블 파티셔닝 전략', 600), v('쿼리 최적화 실전 케이스', 780)], '2. 최적화 실전')] },
    { title: '데이터 모델링 면접 대비', description: 'ER 다이어그램·정규화·반정규화를 실무 시나리오와 함께 면접 관점으로 학습합니다.', category: '데이터베이스', difficulty: '중급', price: '49000', sections: [s([v('ERD 설계 실습', 600), v('정규화 1NF~3NF', 660)], '1. 모델링 기초'), s([v('반정규화 적용 기준', 540), v('설계 면접 시나리오', 720)], '2. 실전 설계')] },

    // ── 시스템설계 ──
    { title: '대규모 서비스 설계 면접 입문', description: 'URL 단축기·채팅 시스템·뉴스피드 등 대표 설계 문제를 단계별로 풀어봅니다.', category: '시스템설계', difficulty: '중급', price: '79000', sections: [s([v('요구사항 명확화 전략', 600), v('URL 단축 서비스 설계', 780)], '1. 기초 설계'), s([v('채팅 시스템 설계', 840), v('뉴스피드 설계', 900)], '2. 심화 설계')] },
    { title: '캐싱 전략과 설계 패턴 면접', description: 'Redis 캐싱·CDN·Cache-aside·Write-through 전략을 면접 관점으로 정리합니다.', category: '시스템설계', difficulty: '중급', price: '59000', sections: [s([v('캐시 무효화 전략', 600), v('Redis 데이터 구조 활용', 660)], '1. 캐싱 기초'), s([v('CDN과 엣지 캐싱', 540), v('캐시 설계 면접 Q&A', 600)], '2. 실전 적용')] },
    { title: '로드밸런싱과 확장성 설계 면접', description: 'L4/L7 로드밸런서·수평/수직 확장·Auto Scaling을 면접 시나리오로 학습합니다.', category: '시스템설계', difficulty: '고급', price: '99000', sections: [s([v('L4 vs L7 로드밸런서', 720), v('수평 확장 설계 전략', 780)], '1. 확장성'), s([v('Auto Scaling 설계', 660), v('고가용성 패턴', 720)], '2. 가용성')] },
    { title: 'DB 샤딩·복제 면접 심화', description: '데이터베이스 샤딩 전략·리플리케이션·일관성 모델을 면접 질문과 함께 분석합니다.', category: '시스템설계', difficulty: '고급', price: '119000', sections: [s([v('샤딩 전략 비교', 840), v('리드 레플리카 활용', 780)], '1. DB 확장'), s([v('Eventually Consistent 모델', 720), v('일관성 vs 가용성 트레이드오프', 780)], '2. 분산 DB')] },
    { title: '메시지 큐와 이벤트 드리븐 설계 면접', description: 'Kafka·RabbitMQ·이벤트 소싱 패턴을 대규모 시스템 설계 면접에 적용하는 방법을 다룹니다.', category: '시스템설계', difficulty: '고급', price: '109000', sections: [s([v('Kafka 아키텍처 완전 이해', 780), v('메시지 큐 선택 기준', 660)], '1. 메시지 큐'), s([v('이벤트 소싱과 CQRS', 840), v('설계 면접 실전 케이스', 900)], '2. 이벤트 드리븐')] },

    // ── DevOps/클라우드 ──
    { title: 'AWS 클라우드 면접 핵심 정리', description: 'EC2·S3·RDS·Lambda·VPC 등 AWS 핵심 서비스를 면접 관점으로 완전 정리합니다.', category: 'DevOps/클라우드', difficulty: '중급', price: '79000', sections: [s([v('EC2·VPC 네트워크 구성', 660), v('S3·CloudFront 활용', 600)], '1. 핵심 서비스'), s([v('Lambda 서버리스 면접', 600), v('IAM 보안 정책', 540)], '2. 서버리스와 보안')] },
    { title: 'Docker/Kubernetes 면접 완전 정복', description: '컨테이너 원리·K8s 아키텍처·Pod/Service/Ingress를 면접 질문과 함께 마스터합니다.', category: 'DevOps/클라우드', difficulty: '고급', price: '119000', sections: [s([v('Docker 이미지와 레이어', 660), v('컨테이너 네트워크', 600)], '1. Docker 심화'), s([v('K8s Pod·Service·Ingress', 780), v('Helm 차트 활용', 660)], '2. Kubernetes')] },
    { title: 'CI/CD 파이프라인 구축과 면접', description: 'GitHub Actions·Jenkins·ArgoCD로 CI/CD를 구성하고 면접 답변까지 한 번에 준비합니다.', category: 'DevOps/클라우드', difficulty: '중급', price: '69000', sections: [s([v('GitHub Actions 워크플로우', 600), v('Jenkins 파이프라인 설계', 660)], '1. CI 구축'), s([v('ArgoCD GitOps 전략', 720), v('배포 전략 Blue/Green·Canary', 660)], '2. CD 전략')] },
    { title: '리눅스 시스템 면접 완전 정복', description: '프로세스·파일시스템·네트워크 명령어·쉘 스크립트를 면접 출제 패턴으로 정리합니다.', category: 'DevOps/클라우드', difficulty: '중급', price: '49000', sections: [s([v('프로세스 관리 명령어', 480), v('파일시스템과 권한 관리', 540)], '1. 리눅스 기초'), s([v('네트워크 진단 도구', 600), v('쉘 스크립트 자동화', 540)], '2. 네트워크와 자동화')] },
    { title: '클라우드 비용 최적화·아키텍처 면접', description: 'Well-Architected Framework·비용 최적화·보안 아키텍처를 면접 시나리오로 학습합니다.', category: 'DevOps/클라우드', difficulty: '고급', price: '99000', sections: [s([v('Well-Architected 5기둥', 720), v('비용 최적화 전략', 660)], '1. 아키텍처 원칙'), s([v('클라우드 보안 아키텍처', 720), v('멀티 클라우드 전략', 660)], '2. 보안과 전략')] },

    // ── 데이터/AI ──
    { title: '머신러닝 기술면접 핵심 정리', description: '회귀·분류·클러스터링·과적합 방지 등 ML 면접 단골 질문을 체계적으로 정리합니다.', category: '데이터/AI', difficulty: '중급', price: '89000', sections: [s([v('편향-분산 트레이드오프', 720), v('과적합 방지 전략', 660)], '1. ML 핵심 개념'), s([v('앙상블 기법 완전 이해', 720), v('ML 면접 실전 Q&A', 780)], '2. 모델 선택')] },
    { title: '딥러닝 면접 질문 50선', description: 'CNN·RNN·Transformer·역전파 알고리즘을 면접 질문과 함께 심층 분석합니다.', category: '데이터/AI', difficulty: '고급', price: '129000', sections: [s([v('역전파 알고리즘 완전 이해', 840), v('CNN 아키텍처 비교', 780)], '1. 딥러닝 기초'), s([v('Transformer와 Attention', 900), v('실전 딥러닝 면접 50문제', 1200)], '2. 최신 트렌드')] },
    { title: '데이터 분석 SQL 면접 완전 정복', description: '데이터 분석가 필수 SQL 패턴(Window Function·CTE·피벗)을 면접 관점으로 정리합니다.', category: '데이터/AI', difficulty: '초급', price: '49000', sections: [s([v('Window Function 완전 정복', 600), v('CTE와 재귀 쿼리', 660)], '1. 분석 SQL'), s([v('피벗과 언피벗', 540), v('데이터 분석 면접 문제 풀이', 780)], '2. 실전 적용')] },
    { title: '통계·확률 기초 면접 대비', description: 'A/B 테스트·가설 검정·확률 분포 등 데이터 직군 면접 필수 통계를 쉽게 풀이합니다.', category: '데이터/AI', difficulty: '초급', price: '39000', sections: [s([v('확률 분포 완전 이해', 480), v('가설 검정 기초', 540)], '1. 통계 기초'), s([v('A/B 테스트 설계', 600), v('통계 면접 Q&A', 540)], '2. 실전 통계')] },
    { title: '데이터 엔지니어링 면접 실전', description: 'Spark·Airflow·데이터 파이프라인 설계·ETL 아키텍처를 면접 관점으로 심층 분석합니다.', category: '데이터/AI', difficulty: '고급', price: '109000', sections: [s([v('Spark RDD vs DataFrame', 780), v('Airflow DAG 설계', 720)], '1. 데이터 파이프라인'), s([v('ETL vs ELT 전략', 660), v('데이터 레이크하우스 아키텍처', 840)], '2. 아키텍처')] },

    // ── 모바일(Android/iOS) ──
    { title: 'Android 기술면접 핵심 정리', description: 'Activity/Fragment 생명주기·Jetpack Compose·Room DB를 면접 질문으로 완전 정복합니다.', category: '모바일(Android/iOS)', difficulty: '중급', price: '79000', sections: [s([v('Activity/Fragment 생명주기', 720), v('ViewModel과 LiveData', 660)], '1. Android 기초'), s([v('Jetpack Compose 면접', 720), v('Room DB와 Coroutine', 660)], '2. 최신 안드로이드')] },
    { title: 'iOS Swift 면접 대비 실전', description: 'Swift 옵셔널·ARC·Combine·SwiftUI를 면접 시나리오와 함께 심층 분석합니다.', category: '모바일(Android/iOS)', difficulty: '중급', price: '89000', sections: [s([v('ARC 메모리 관리', 720), v('Swift 옵셔널과 에러 처리', 660)], '1. Swift 기초'), s([v('Combine 반응형 프로그래밍', 720), v('SwiftUI 면접 Q&A', 660)], '2. 최신 iOS')] },
    { title: 'React Native 크로스플랫폼 면접', description: 'React Native 아키텍처·Bridge·Native Modules를 면접 관점으로 완전 정리합니다.', category: '모바일(Android/iOS)', difficulty: '중급', price: '69000', sections: [s([v('New Architecture 이해', 720), v('Native Bridge 동작 원리', 660)], '1. RN 아키텍처'), s([v('성능 최적화 전략', 600), v('RN 면접 실전 Q&A', 720)], '2. 성능과 면접')] },
    { title: '모바일 앱 성능 최적화 면접', description: '배터리·메모리·렌더링 최적화와 앱 성능 측정 도구를 면접 답변으로 구성합니다.', category: '모바일(Android/iOS)', difficulty: '고급', price: '99000', sections: [s([v('메모리 누수 탐지 전략', 780), v('렌더링 성능 최적화', 720)], '1. 성능 분석'), s([v('배터리·네트워크 최적화', 660), v('Profiling 도구 활용', 600)], '2. 측정과 개선')] },
    { title: '앱 아키텍처 패턴 면접 (MVVM/MVI)', description: 'MVVM·MVI·Clean Architecture를 모바일 면접에서 설득력 있게 설명하는 법을 다룹니다.', category: '모바일(Android/iOS)', difficulty: '고급', price: '109000', sections: [s([v('MVVM 패턴 완전 이해', 780), v('MVI와 단방향 데이터 흐름', 720)], '1. 아키텍처 패턴'), s([v('Clean Architecture 적용', 840), v('아키텍처 면접 시나리오', 780)], '2. 실전 적용')] },

    // ── 보안/네트워크 ──
    { title: '네트워크 TCP/IP 기술면접 핵심', description: 'OSI 7계층·TCP/IP·3-way handshake·DNS를 면접 단골 질문으로 완전 정리합니다.', category: '보안/네트워크', difficulty: '초급', price: '39000', sections: [s([v('OSI 7계층 완전 이해', 480), v('TCP 3-way Handshake', 540)], '1. 네트워크 기초'), s([v('DNS와 CDN 동작 원리', 600), v('TCP vs UDP 비교', 480)], '2. 프로토콜')] },
    { title: 'HTTP/HTTPS 웹 보안 면접', description: 'HTTPS·TLS·쿠키/세션·CORS·CSRF/XSS 방어를 면접 관점으로 심층 분석합니다.', category: '보안/네트워크', difficulty: '중급', price: '59000', sections: [s([v('TLS 핸드셰이크 과정', 660), v('CORS 동작 원리와 설정', 600)], '1. 웹 보안 기초'), s([v('CSRF·XSS 방어 전략', 660), v('쿠키·세션·JWT 비교', 720)], '2. 취약점 방어')] },
    { title: '정보보안 취약점 대응 면접', description: 'OWASP Top 10·침투 테스트·보안 감사를 실무 시나리오와 함께 면접 대비합니다.', category: '보안/네트워크', difficulty: '고급', price: '99000', sections: [s([v('OWASP Top 10 완전 분석', 840), v('SQL 인젝션 방어 전략', 720)], '1. 취약점 분석'), s([v('침투 테스트 방법론', 780), v('보안 감사 면접 Q&A', 720)], '2. 실전 대응')] },
    { title: 'OAuth·JWT 인증 보안 면접', description: 'OAuth 2.0 플로우·JWT 구조·토큰 갱신·보안 취약점을 면접 질문으로 완전 정리합니다.', category: '보안/네트워크', difficulty: '중급', price: '69000', sections: [s([v('OAuth 2.0 플로우 완전 이해', 720), v('JWT 구조와 서명 검증', 660)], '1. 인증 기초'), s([v('토큰 갱신 전략', 600), v('인증 보안 취약점 방어', 720)], '2. 보안 심화')] },
    { title: '방화벽·VPN 인프라 보안 면접', description: '방화벽 정책·VPN 프로토콜·제로 트러스트 보안 모델을 면접 시나리오로 학습합니다.', category: '보안/네트워크', difficulty: '고급', price: '89000', sections: [s([v('방화벽 정책 설계', 720), v('VPN 프로토콜 비교', 660)], '1. 인프라 보안'), s([v('제로 트러스트 아키텍처', 780), v('보안 인프라 면접 Q&A', 720)], '2. 보안 아키텍처')] },

    // ── CS기초 ──
    { title: '운영체제 기술면접 핵심 정리', description: '프로세스·스레드·스케줄링·메모리 관리·교착상태를 면접 질문으로 완전 정복합니다.', category: 'CS기초', difficulty: '중급', price: '59000', sections: [s([v('프로세스 vs 스레드', 600), v('CPU 스케줄링 알고리즘', 660)], '1. 프로세스 관리'), s([v('교착상태 탐지와 예방', 720), v('가상 메모리와 페이징', 660)], '2. 메모리 관리')] },
    { title: '컴퓨터 구조 면접 완전 정복', description: 'CPU 파이프라인·캐시 메모리·명령어 세트·인터럽트를 면접 관점으로 정리합니다.', category: 'CS기초', difficulty: '중급', price: '49000', sections: [s([v('CPU 파이프라인 동작', 600), v('캐시 메모리 계층 구조', 660)], '1. CPU 구조'), s([v('인터럽트 처리 과정', 540), v('명령어 세트 아키텍처', 600)], '2. 명령어와 인터럽트')] },
    { title: '멀티스레딩·동시성 면접 심화', description: '뮤텍스·세마포어·Race Condition·Lock-Free 자료구조를 면접 질문과 함께 분석합니다.', category: 'CS기초', difficulty: '고급', price: '89000', sections: [s([v('Race Condition과 임계구역', 780), v('뮤텍스 vs 세마포어', 720)], '1. 동시성 제어'), s([v('Lock-Free 알고리즘', 840), v('동시성 버그 디버깅', 720)], '2. 고급 동시성')] },
    { title: '메모리 구조와 가상화 면접', description: '가상 메모리·페이징·세그멘테이션·TLB를 면접 시나리오로 심층 학습합니다.', category: 'CS기초', difficulty: '고급', price: '79000', sections: [s([v('가상 주소 변환 과정', 720), v('페이지 교체 알고리즘', 780)], '1. 가상 메모리'), s([v('TLB와 캐시 최적화', 660), v('메모리 면접 시나리오', 720)], '2. 실전 적용')] },
    { title: 'CS기초 통합 면접 벼락치기 30일', description: '자료구조·OS·네트워크·DB 핵심을 30일 커리큘럼으로 빠르게 정리하는 CS 입문 총정리.', category: 'CS기초', difficulty: '초급', price: '0', sections: [s([v('자료구조 1일~10일', 900), v('OS 11일~20일', 900)], '1. 상반기 커리큘럼'), s([v('네트워크 21일~25일', 720), v('DB 26일~30일', 720)], '2. 하반기 커리큘럼')] },

    // ── 인성면접 ──
    { title: '인성면접 답변 구조화 STAR 기법', description: 'STAR 기법으로 경험 기반 답변을 구조화하고 설득력 있는 스토리라인을 완성합니다.', category: '인성면접', difficulty: '초급', price: '0', sections: [s([v('STAR 기법 완전 이해', 420), v('지원동기 설계 전략', 540)], '1. 답변 구조화'), s([v('압박 질문 대응법', 480), v('실전 모의 면접', 600)], '2. 실전 훈련')] },
    { title: '1분 자기소개 완성 클래스', description: '직무 적합성을 어필하는 30초·1분·3분 자기소개 템플릿을 완성합니다.', category: '인성면접', difficulty: '초급', price: '29000', sections: [s([v('자기소개 구조 잡기', 360), v('강점 키워드 발굴법', 420)], '1. 자기소개 기초'), s([v('산업별 맞춤 자기소개', 480), v('실전 피드백 세션', 540)], '2. 실전 완성')] },
    { title: '갈등 상황 대처법 면접 실전', description: '조직 내 갈등·실패 경험·압박 질문을 전략적으로 대응하는 방법을 훈련합니다.', category: '인성면접', difficulty: '중급', price: '49000', sections: [s([v('갈등 상황 유형 분석', 480), v('실패 경험 포장법', 540)], '1. 어려운 질문 대응'), s([v('압박 면접 시뮬레이션', 600), v('감정 조절 전략', 480)], '2. 압박 면접')] },
    { title: '성장·실패 경험 스토리텔링', description: '성장 스토리와 실패 경험을 임팩트 있게 정리하여 면접관을 설득하는 기술을 배웁니다.', category: '인성면접', difficulty: '초급', price: '39000', sections: [s([v('성장 경험 발굴 워크숍', 480), v('실패 경험 재해석법', 540)], '1. 경험 정리'), s([v('스토리 임팩트 높이기', 600), v('면접관 시선으로 검토', 540)], '2. 스토리텔링')] },
    { title: '직장인 태도·가치관 면접 전략', description: '직업 가치관·팀워크·리더십 경험을 구체적 사례와 함께 답변하는 전략을 완성합니다.', category: '인성면접', difficulty: '중급', price: '59000', sections: [s([v('가치관 면접 답변 구조', 540), v('팀워크 경험 구체화', 600)], '1. 가치관과 태도'), s([v('리더십 경험 어필 전략', 660), v('직무 가치관 연결하기', 600)], '2. 리더십')] },
    { title: '면접 합격을 부르는 이력서 작성법', description: '문장 다듬기·프로젝트 임팩트 정리·포트폴리오 구성까지 이력서 완성 클래스.', category: '인성면접', difficulty: '중급', price: '49000', sections: [s([v('프로젝트 임팩트 작성법', 600), v('수치로 성과 표현하기', 540)], '1. 이력서 작성'), s([v('포트폴리오 구성 전략', 600), v('이력서 첨삭 실전', 720)], '2. 포트폴리오')] },

    // ── PT면접 ──
    { title: 'PT 면접 10분 스피치 마스터', description: '10분 PT를 위한 구조(문제-원인-해결-효과)와 발표 전달력을 실전 훈련합니다.', category: 'PT면접', difficulty: '고급', price: '129000', sections: [s([v('PT 구조 잡기 전략', 600), v('슬라이드 설계 원칙', 540)], '1. PT 구성'), s([v('발표 전달력 훈련', 660), v('Q&A 대응 전략', 480)], '2. 발표력')] },
    { title: '문서 기반 PT 구성 전략', description: '주어진 자료를 빠르게 분석하고 논리적인 PT 구조를 5분 안에 완성하는 전략을 다룹니다.', category: 'PT면접', difficulty: '중급', price: '79000', sections: [s([v('자료 분석 5분 전략', 600), v('핵심 메시지 도출법', 540)], '1. 자료 분석'), s([v('PT 논리 구조 완성', 660), v('시간 관리 전략', 480)], '2. 구성 전략')] },
    { title: 'PT 자료 준비와 발표 기술', description: 'PT 슬라이드 구성·핵심 메시지 전달·시각 보조자료 활용 방법을 처음부터 배웁니다.', category: 'PT면접', difficulty: '초급', price: '49000', sections: [s([v('슬라이드 구성 원칙', 480), v('도표와 그래프 활용', 420)], '1. 시각 자료'), s([v('목소리와 시선 처리', 540), v('질의응답 연습', 480)], '2. 발표 기술')] },
    { title: '케이스 PT 실전 풀이 20문제', description: '대기업·컨설팅·공기업 실제 PT 기출 20문제를 단계별로 풀어보며 완전 정복합니다.', category: 'PT면접', difficulty: '고급', price: '109000', sections: [s([v('대기업 PT 기출 10문제', 1200), v('공기업 PT 기출 분석', 780)], '1. 기출 풀이'), s([v('컨설팅 케이스 PT', 900), v('총정리 모의고사', 1200)], '2. 실전 모의')] },
    { title: '비대면 화상 PT 면접 완전 대비', description: '화상 면접 환경 세팅·시선 처리·음성 전달력을 비대면 PT에 맞게 최적화합니다.', category: 'PT면접', difficulty: '중급', price: '59000', sections: [s([v('화상 면접 환경 세팅', 420), v('카메라 시선 처리 연습', 480)], '1. 비대면 환경'), s([v('음성과 발음 최적화', 540), v('화상 PT 실전 시뮬레이션', 600)], '2. 발표 최적화')] },

    // ── 영어면접 ──
    { title: '영어면접 필수 표현 100', description: '자기소개·경력·프로젝트 설명에 꼭 필요한 영어 표현 100개를 상황별로 정리합니다.', category: '영어면접', difficulty: '초급', price: '39000', sections: [s([v('Tell me about yourself', 300), v('Why did you apply?', 420)], '1. 기본 표현'), s([v('Project & Achievement 표현', 480), v('영어 답변 실전 연습', 540)], '2. 실전 표현')] },
    { title: 'Tell me about yourself 완전 정복', description: '영어 1분 자기소개부터 직무 연계 스토리까지 단계별로 완성하는 집중 클래스.', category: '영어면접', difficulty: '초급', price: '0', sections: [s([v('자기소개 영어 구조', 300), v('Present-Past-Future 템플릿', 360)], '1. 자기소개 구조'), s([v('직무 연계 스토리텔링', 420), v('실전 녹화 피드백', 480)], '2. 실전 완성')] },
    { title: '외국계 기업 영어면접 전략', description: '외국계 기업이 선호하는 답변 구조·문화 적합성 어필·영어 압박 질문 대응법을 학습합니다.', category: '영어면접', difficulty: '중급', price: '89000', sections: [s([v('외국계 기업 인재상 분석', 600), v('Cultural Fit 어필 전략', 660)], '1. 기업 이해'), s([v('압박 영어 질문 대응', 720), v('Behavioral Interview 전략', 780)], '2. 실전 전략')] },
    { title: '비즈니스 영어 면접 표현 마스터', description: 'Behavioral Question·Situational Question에 답하는 비즈니스 영어 표현을 마스터합니다.', category: '영어면접', difficulty: '중급', price: '69000', sections: [s([v('STAR in English', 660), v('Situation & Task 표현', 600)], '1. Behavioral 영어'), s([v('Situational Question 전략', 660), v('비즈니스 어휘 마스터', 600)], '2. 상황 대응')] },
    { title: '영어 기술 PT 발표 실전', description: '영어로 기술 프레젠테이션·제안·토론하는 방법을 면접 시나리오와 함께 훈련합니다.', category: '영어면접', difficulty: '고급', price: '99000', sections: [s([v('기술 발표 영어 구조', 720), v('도표·데이터 설명 표현', 660)], '1. 기술 PT'), s([v('영어 토론 진행 전략', 720), v('실전 영어 PT 시뮬레이션', 900)], '2. 토론과 실전')] },

    // ── 그룹면접 ──
    { title: '그룹 토론 면접 완전 정복', description: '찬반 토론·자유 토의·사례 토론 유형별 전략과 존재감 드러내는 발언법을 훈련합니다.', category: '그룹면접', difficulty: '중급', price: '59000', sections: [s([v('그룹면접 유형 분석', 480), v('토론 첫 발언 전략', 540)], '1. 토론 기본'), s([v('반론과 설득 기술', 600), v('합의 도출 전략', 540)], '2. 발언 전략')] },
    { title: '그룹 PT 협업 전략', description: '역할 분담·의견 조율·합의 도출 과정을 면접관이 선호하는 방식으로 보여주는 전략을 배웁니다.', category: '그룹면접', difficulty: '중급', price: '69000', sections: [s([v('역할 분담 전략', 480), v('팀 의견 조율법', 540)], '1. 협업 전략'), s([v('발표자 vs 서포터 역할', 600), v('그룹 PT 실전 연습', 660)], '2. 실전 훈련')] },
    { title: '그룹면접 관찰자 시선 사로잡기', description: '발언하지 않을 때도 평가받는다! 경청·리액션·비언어적 표현으로 존재감을 높이는 전략.', category: '그룹면접', difficulty: '고급', price: '89000', sections: [s([v('비언어적 표현 전략', 600), v('경청 기술과 리액션', 540)], '1. 비언어 커뮤니케이션'), s([v('존재감 드러내기', 660), v('그룹면접 합격 사례 분석', 720)], '2. 고급 전략')] },
    { title: '토의형 면접 설득력 향상', description: '논리적 주장 구성·반론 대응·공감대 형성 등 설득 커뮤니케이션 기초를 다집니다.', category: '그룹면접', difficulty: '초급', price: '39000', sections: [s([v('논리적 주장 구성법', 480), v('근거 제시 전략', 420)], '1. 설득 기초'), s([v('반론 대응 기술', 540), v('공감대 형성 전략', 480)], '2. 토의 기술')] },
    { title: '그룹면접 합격 사례 20선 분석', description: '실제 대기업·공기업 그룹면접 합격자 20명의 사례를 분석하여 패턴을 도출합니다.', category: '그룹면접', difficulty: '중급', price: '49000', sections: [s([v('대기업 합격 사례 10선', 900), v('공기업 합격 사례 10선', 900)], '1. 합격 사례 분석'), s([v('패턴 분석과 전략 도출', 600), v('나에게 적용하기', 540)], '2. 전략 수립')] },

    // ── 금융/은행 ──
    { title: '은행권 기술·직무 면접 핵심', description: '시중은행·지방은행·인터넷전문은행 직무 면접을 역할별로 체계적으로 대비합니다.', category: '금융/은행', difficulty: '중급', price: '79000', sections: [s([v('은행 직무별 핵심 역량', 660), v('금융 시사 이슈 대응법', 600)], '1. 은행 직무'), s([v('영업·PB·기업금융 면접', 720), v('IT·디지털 직군 면접', 660)], '2. 직군별 전략')] },
    { title: '금융공기업 NCS 기반 면접 전략', description: '금융감독원·산업은행·수출입은행 NCS 직무역량 면접을 단계별로 대비합니다.', category: '금융/은행', difficulty: '초급', price: '49000', sections: [s([v('금융 NCS 직무역량 분석', 540), v('자기소개서 연계 면접', 600)], '1. NCS 기초'), s([v('금융 공기업별 기출 분석', 720), v('실전 모의 면접', 780)], '2. 기관별 전략')] },
    { title: '투자은행(IB) 면접 전략', description: '증권사·투자은행 Investment Banking 부서 면접에서 요구하는 재무 지식과 케이스를 다룹니다.', category: '금융/은행', difficulty: '고급', price: '129000', sections: [s([v('IB 직무 이해와 면접 특성', 720), v('재무제표 분석 면접', 840)], '1. IB 기초'), s([v('DCF 밸류에이션 면접', 900), v('IB 케이스 인터뷰 실전', 1200)], '2. 케이스 인터뷰')] },
    { title: '보험·증권 직무 면접 완전 정복', description: '생명보험·손해보험·증권사 직무별 면접 유형과 자주 나오는 질문을 완전 정리합니다.', category: '금융/은행', difficulty: '중급', price: '69000', sections: [s([v('보험 직무 면접 핵심', 600), v('증권사 리서치·트레이딩 면접', 660)], '1. 직무별 면접'), s([v('금융 규제와 컴플라이언스 면접', 540), v('실전 Q&A 훈련', 720)], '2. 규제와 실전')] },
    { title: '핀테크 기업 면접 가이드', description: '카카오페이·토스·카뱅 등 핀테크 기업이 원하는 인재상과 면접 전략을 분석합니다.', category: '금융/은행', difficulty: '중급', price: '59000', sections: [s([v('핀테크 기업 문화 이해', 480), v('기술+금융 융합 역량 어필', 600)], '1. 핀테크 이해'), s([v('스타트업 vs 대기업 면접 차이', 540), v('핀테크 실전 면접 Q&A', 660)], '2. 기업별 전략')] },

    // ── 마케팅/광고 ──
    { title: '디지털 마케팅 면접 핵심 정리', description: 'SEO·SEM·SNS 마케팅·퍼포먼스 지표를 마케팅 직군 면접 관점으로 완전 정리합니다.', category: '마케팅/광고', difficulty: '초급', price: '39000', sections: [s([v('SEO/SEM 기초와 면접', 480), v('SNS 마케팅 전략 면접', 540)], '1. 디지털 기초'), s([v('퍼포먼스 지표 ROAS·CPA', 600), v('디지털 마케팅 Q&A', 540)], '2. 데이터 마케팅')] },
    { title: '브랜드 매니저 면접 전략', description: '브랜드 포지셔닝·IMC 전략·소비자 인사이트를 면접 사례와 함께 학습합니다.', category: '마케팅/광고', difficulty: '중급', price: '69000', sections: [s([v('브랜드 포지셔닝 전략', 600), v('IMC 캠페인 기획 면접', 660)], '1. 브랜드 전략'), s([v('소비자 인사이트 분석', 600), v('브랜드 위기 관리 면접', 540)], '2. 소비자와 위기')] },
    { title: '콘텐츠 마케팅 포트폴리오 면접', description: '유튜브·인스타그램·블로그 콘텐츠 전략을 포트폴리오와 함께 면접에서 어필하는 법을 배웁니다.', category: '마케팅/광고', difficulty: '중급', price: '59000', sections: [s([v('콘텐츠 전략 기획 방법', 540), v('채널별 최적화 전략', 600)], '1. 콘텐츠 전략'), s([v('포트폴리오 면접 발표법', 660), v('성과 지표 어필 전략', 600)], '2. 포트폴리오')] },
    { title: '퍼포먼스 마케팅 기술 면접', description: 'CPC·ROAS·LTV·A/B 테스트를 퍼포먼스 마케터 면접에서 설득력 있게 설명하는 법을 다룹니다.', category: '마케팅/광고', difficulty: '고급', price: '89000', sections: [s([v('퍼포먼스 지표 완전 이해', 720), v('A/B 테스트 설계와 분석', 780)], '1. 데이터 기반'), s([v('광고 채널 최적화 전략', 660), v('퍼포먼스 면접 실전 Q&A', 720)], '2. 최적화')] },
    { title: '광고대행사 AE 면접 완전 정복', description: '광고주 대응·캠페인 기획·미디어 믹스 전략을 AE 면접 시나리오로 실전 훈련합니다.', category: '마케팅/광고', difficulty: '중급', price: '79000', sections: [s([v('AE 역할 이해와 면접 특성', 540), v('캠페인 기획서 면접 발표', 720)], '1. AE 기초'), s([v('미디어 믹스 전략 면접', 660), v('광고 PT 면접 실전', 780)], '2. 캠페인 전략')] },

    // ── 영업 ──
    { title: 'B2B 영업직 면접 핵심 전략', description: '법인 영업·솔루션 세일즈·제안서 작성을 면접 스토리로 구성하는 전략을 학습합니다.', category: '영업', difficulty: '중급', price: '59000', sections: [s([v('B2B 영업 프로세스 이해', 540), v('솔루션 영업 면접 전략', 600)], '1. B2B 영업'), s([v('제안서 기반 면접 발표', 660), v('영업 실적 어필 전략', 600)], '2. 실전 전략')] },
    { title: '세일즈 실적 어필 자기소개 전략', description: '영업 수치·고객 확보 사례를 설득력 있게 포장하여 면접관에게 임팩트를 주는 방법을 다룹니다.', category: '영업', difficulty: '초급', price: '39000', sections: [s([v('영업 수치 데이터화 전략', 480), v('고객 확보 스토리 구성', 540)], '1. 실적 포장'), s([v('신입 영업직 어필 전략', 480), v('영업 자기소개 실전 연습', 540)], '2. 신입 전략')] },
    { title: '고객 응대·CRM 면접 대비', description: '고객 관리·클레임 대응·CS 시스템 활용 경험을 면접 답변으로 구조화합니다.', category: '영업', difficulty: '초급', price: '29000', sections: [s([v('고객 클레임 대응법', 420), v('CRM 시스템 활용 면접', 480)], '1. 고객 관리'), s([v('고객 만족도 향상 사례', 540), v('CS 면접 실전 Q&A', 480)], '2. 실전 대응')] },
    { title: '유통·리테일 영업 면접 전략', description: '대형마트·편의점·온라인 유통 채널 영업 직무의 면접을 완전 대비합니다.', category: '영업', difficulty: '중급', price: '49000', sections: [s([v('유통 채널 이해와 면접', 540), v('리테일 바이어 협상 면접', 600)], '1. 유통 영업'), s([v('온라인 유통 영업 전략', 600), v('유통 면접 기출 분석', 660)], '2. 채널 전략')] },
    { title: '해외 영업직 면접 완전 정복', description: '글로벌 시장 분석·바이어 협상·무역 실무를 해외영업 면접 시나리오로 학습합니다.', category: '영업', difficulty: '고급', price: '99000', sections: [s([v('글로벌 시장 분석 면접', 720), v('무역 실무 지식 면접', 660)], '1. 해외 영업 지식'), s([v('영어 바이어 협상 시뮬레이션', 780), v('해외 영업 면접 Q&A', 720)], '2. 실전 훈련')] },

    // ── 의료/간호 ──
    { title: '간호사 취업 면접 핵심 전략', description: '대학병원·종합병원·요양원 등 병원 유형별 간호사 면접을 역할별로 완전 대비합니다.', category: '의료/간호', difficulty: '초급', price: '49000', sections: [s([v('간호사 면접 유형 분석', 480), v('임상 경험 어필 전략', 540)], '1. 기본 전략'), s([v('병원 유형별 맞춤 전략', 600), v('간호 면접 실전 Q&A', 660)], '2. 병원별 전략')] },
    { title: '병원 의료기사 면접 완전 정복', description: '임상병리사·방사선사·물리치료사·작업치료사 직무별 면접 유형과 답변 전략을 정리합니다.', category: '의료/간호', difficulty: '중급', price: '59000', sections: [s([v('의료기사 직무별 특성', 540), v('임상병리·방사선 면접', 600)], '1. 직무별 면접'), s([v('물리치료·작업치료 면접', 600), v('의료기사 기출 Q&A', 660)], '2. 실전 적용')] },
    { title: '약사 채용 면접 전략', description: '약국·병원·제약회사·CRO 약사 직무별 면접 질문과 경력 기반 답변법을 학습합니다.', category: '의료/간호', difficulty: '중급', price: '69000', sections: [s([v('약사 직무 환경 이해', 480), v('약국 면접 핵심 전략', 540)], '1. 약사 면접'), s([v('제약회사·CRO 면접', 660), v('약사 면접 기출 Q&A', 720)], '2. 산업별 전략')] },
    { title: '의료기기 영업·마케팅 면접', description: '의료기기 영업 특성·제품 지식·병원 영업 전략을 면접 관점으로 심층 분석합니다.', category: '의료/간호', difficulty: '중급', price: '79000', sections: [s([v('의료기기 산업 이해', 540), v('병원 영업 전략 면접', 660)], '1. 영업 전략'), s([v('의료기기 규제 지식 면접', 600), v('의료기기 마케팅 면접', 660)], '2. 마케팅')] },
    { title: '보건직 공무원 면접 대비', description: '보건직 9급 공무원·보건소·공공의료기관 직무 면접을 완전 대비합니다.', category: '의료/간호', difficulty: '초급', price: '39000', sections: [s([v('보건직 직무 이해', 420), v('공중보건 시사 대응', 480)], '1. 기초 지식'), s([v('보건직 면접 기출 분석', 600), v('실전 모의 면접', 540)], '2. 실전 대비')] },

    // ── 공무원/공기업 ──
    { title: '9급 공무원 면접 합격 전략', description: '국가직·지방직 9급 공무원 면접의 평가 기준과 자주 나오는 질문을 완전 정복합니다.', category: '공무원/공기업', difficulty: '초급', price: '49000', sections: [s([v('공무원 면접 평가 기준', 480), v('5분 스피치 전략', 540)], '1. 공무원 면접 기초'), s([v('집단 토론 면접 전략', 600), v('공무원 기출 Q&A 분석', 660)], '2. 유형별 전략')] },
    { title: '공기업 NCS 직무역량 면접', description: '한전·코레일·LH 등 주요 공기업 NCS 기반 직무역량 면접을 유형별로 완전 대비합니다.', category: '공무원/공기업', difficulty: '중급', price: '69000', sections: [s([v('NCS 직무역량 이해', 600), v('경험 기반 면접 구성', 660)], '1. NCS 면접'), s([v('공기업별 맞춤 전략', 720), v('NCS 실전 모의 면접', 780)], '2. 기관별 전략')] },
    { title: '공기업 PT 면접 완전 대비', description: '공기업 PT 면접 기출문제를 분석하고 10분 발표와 Q&A를 실전 훈련합니다.', category: '공무원/공기업', difficulty: '중급', price: '79000', sections: [s([v('공기업 PT 기출 분석', 720), v('10분 발표 구성 전략', 660)], '1. PT 전략'), s([v('Q&A 대응 전략', 600), v('공기업 PT 실전 연습', 780)], '2. 실전 훈련')] },
    { title: '국가직 면접 기출 완전 분석', description: '5년간 국가직 면접 기출 문제를 유형별로 분석하고 고득점 답변 전략을 제시합니다.', category: '공무원/공기업', difficulty: '고급', price: '99000', sections: [s([v('국가직 면접 기출 5년 분석', 960), v('유형별 고득점 전략', 780)], '1. 기출 분석'), s([v('5분 스피치 고득점 전략', 720), v('국가직 실전 모의 면접', 840)], '2. 고득점 전략')] },
    { title: '지방직 공무원 면접 실전', description: '지역별 특색을 반영한 지방직 공무원 면접 대비와 자기소개·지원동기 완성 클래스.', category: '공무원/공기업', difficulty: '초급', price: '0', sections: [s([v('지방직 면접 특성 이해', 420), v('지역 시사 이슈 준비법', 480)], '1. 지방직 기초'), s([v('자기소개·지원동기 완성', 540), v('지방직 기출 Q&A', 600)], '2. 실전 완성')] },

    // ── 교육/강사 ──
    { title: '교원 임용 면접 핵심 전략', description: '2차 임용 심층 면접·수업 실연·교직 적성 면접을 단계별로 완전 대비합니다.', category: '교육/강사', difficulty: '중급', price: '79000', sections: [s([v('교직 적성 면접 전략', 600), v('수업 실연 준비 방법', 720)], '1. 임용 면접'), s([v('심층 면접 고득점 전략', 660), v('임용 면접 기출 분석', 780)], '2. 고득점 전략')] },
    { title: '기업 HRD 강사 채용 면접', description: '기업 연수원·HRD 팀 강사 채용 면접에서 교수 설계 역량과 퍼실리테이션 기술을 어필합니다.', category: '교육/강사', difficulty: '중급', price: '59000', sections: [s([v('HRD 강사 역량 이해', 540), v('교수 설계 포트폴리오 면접', 660)], '1. HRD 기초'), s([v('퍼실리테이션 기술 어필', 600), v('HRD 면접 실전 Q&A', 660)], '2. 실전 전략')] },
    { title: '학원 강사 면접 합격 비법', description: '학원 시범 강의·교육 철학·학생 관리 능력을 면접에서 임팩트 있게 보여주는 전략을 다룹니다.', category: '교육/강사', difficulty: '초급', price: '39000', sections: [s([v('시범 강의 준비 전략', 480), v('교육 철학 답변 구성', 420)], '1. 학원 면접 기초'), s([v('학생·학부모 관계 관리', 540), v('학원별 맞춤 전략', 480)], '2. 실전 적용')] },
    { title: '코딩 교육 강사 면접 대비', description: '초중고 코딩 교육·SW 교육 강사 채용 면접에서 교육 역량과 기술 지식을 균형 있게 어필합니다.', category: '교육/강사', difficulty: '중급', price: '49000', sections: [s([v('SW 교육 트렌드 이해', 480), v('코딩 시범 강의 준비', 540)], '1. SW 교육'), s([v('교육 역량 + 기술 역량 어필', 600), v('코딩 강사 면접 Q&A', 540)], '2. 실전 전략')] },
    { title: '평생교육사 취업 면접 가이드', description: '평생교육관·복지관·기업 교육팀 평생교육사 채용 면접을 직무별로 완전 대비합니다.', category: '교육/강사', difficulty: '초급', price: '29000', sections: [s([v('평생교육사 직무 이해', 360), v('기관별 면접 특성', 420)], '1. 직무 이해'), s([v('자기소개·지원동기 완성', 480), v('평생교육 면접 Q&A', 480)], '2. 실전 완성')] },

    // ── 디자인 ──
    { title: 'UX/UI 디자이너 포트폴리오 면접', description: 'UX 리서치·와이어프레임·프로토타입을 면접에서 설득력 있게 설명하는 포트폴리오 전략을 배웁니다.', category: '디자인', difficulty: '중급', price: '89000', sections: [s([v('UX 리서치 과정 설명법', 720), v('와이어프레임 발표 전략', 660)], '1. UX 포트폴리오'), s([v('UI 시스템 디자인 면접', 660), v('포트폴리오 발표 실전', 720)], '2. 발표 전략')] },
    { title: '그래픽 디자인 면접 전략', description: '브랜드 아이덴티티·인쇄물·편집 디자인 포트폴리오를 면접에서 임팩트 있게 발표하는 법을 다룹니다.', category: '디자인', difficulty: '초급', price: '49000', sections: [s([v('포트폴리오 구성 전략', 480), v('디자인 의도 설명법', 540)], '1. 포트폴리오'), s([v('브랜드 아이덴티티 면접', 600), v('디자인 면접 Q&A', 540)], '2. 실전 발표')] },
    { title: '브랜드 디자이너 취업 면접', description: '브랜드 전략·로고·BI 디자인 경험을 면접 스토리로 구성하는 완전 정복 클래스.', category: '디자인', difficulty: '중급', price: '69000', sections: [s([v('브랜드 전략 이해와 면접', 600), v('로고 디자인 프로세스 설명', 660)], '1. 브랜드 디자인'), s([v('BI 시스템 구축 사례 발표', 720), v('브랜드 디자인 면접 Q&A', 660)], '2. 실전 케이스')] },
    { title: '영상·모션 디자인 면접 대비', description: 'After Effects·Premiere Pro 기반 모션 포트폴리오를 영상 직군 면접에 효과적으로 어필합니다.', category: '디자인', difficulty: '중급', price: '79000', sections: [s([v('모션 그래픽 포트폴리오 구성', 720), v('AE 작업 프로세스 설명', 660)], '1. 모션 포트폴리오'), s([v('영상 제작 사례 발표', 720), v('영상 디자인 면접 Q&A', 660)], '2. 실전 발표')] },
    { title: '제품 디자인 직무 면접 완전 정복', description: '산업 디자인·제품 기획·프로토타이핑 역량을 기업 제품 디자이너 면접 시나리오로 학습합니다.', category: '디자인', difficulty: '고급', price: '109000', sections: [s([v('제품 디자인 프로세스 면접', 840), v('CMF 전략과 소재 지식', 720)], '1. 제품 디자인'), s([v('프로토타이핑 사례 발표', 780), v('제품 디자인 심층 면접', 840)], '2. 심화 면접')] },

    // ── 경영/기획 ──
    { title: '경영기획 직무 면접 완전 정복', description: '전략 수립·예산 기획·KPI 관리 경험을 경영기획 면접에서 임팩트 있게 어필합니다.', category: '경영/기획', difficulty: '중급', price: '79000', sections: [s([v('경영기획 직무 이해', 540), v('전략 수립 사례 발표', 720)], '1. 직무 전략'), s([v('예산·KPI 관리 경험 어필', 660), v('경영기획 면접 Q&A', 720)], '2. 실전 적용')] },
    { title: '전략 컨설턴트 케이스 인터뷰', description: '4대 컨설팅 펌 케이스 인터뷰 20문제를 MECE·이슈트리·수치 추정으로 완전 정복합니다.', category: '경영/기획', difficulty: '고급', price: '149000', sections: [s([v('MECE와 이슈트리 기초', 900), v('Market Sizing 수치 추정', 960)], '1. 케이스 기초'), s([v('케이스 20문제 실전 풀이', 1800), v('케이스 인터뷰 피드백', 900)], '2. 실전 케이스')] },
    { title: 'PM/PO 프로덕트 매니저 면접', description: '제품 기획·로드맵·지표 분석·우선순위 결정을 IT기업 PM/PO 면접 시나리오로 학습합니다.', category: '경영/기획', difficulty: '고급', price: '119000', sections: [s([v('PM/PO 역할과 면접 특성', 720), v('제품 로드맵 면접', 840)], '1. PM/PO 기초'), s([v('지표 분석과 의사결정 면접', 900), v('PM 케이스 인터뷰 실전', 1080)], '2. 케이스 인터뷰')] },
    { title: '신사업 기획 직무 면접 전략', description: '시장 조사·비즈니스 모델 캔버스·사업 타당성 분석을 면접에서 설득력 있게 발표합니다.', category: '경영/기획', difficulty: '중급', price: '69000', sections: [s([v('시장 분석 방법론 면접', 720), v('BMC 기반 사업 기획 면접', 780)], '1. 사업 기획'), s([v('타당성 분석과 발표', 720), v('신사업 기획 면접 Q&A', 660)], '2. 실전 발표')] },
    { title: 'IR 발표·스타트업 면접 전략', description: '투자자 대상 IR 발표와 스타트업 전략기획 면접을 실전 시나리오로 완전 대비합니다.', category: '경영/기획', difficulty: '고급', price: '99000', sections: [s([v('IR 덱 구성 전략', 840), v('투자자 Q&A 대응법', 780)], '1. IR 발표'), s([v('스타트업 면접 특성 이해', 660), v('스타트업 전략 기획 면접', 780)], '2. 스타트업')] },

    // ── 법률/회계 ──
    { title: '법무팀 인하우스 변호사 면접', description: '계약 검토·분쟁 대응·규제 준수를 기업 법무팀 채용 면접 시나리오로 완전 대비합니다.', category: '법률/회계', difficulty: '고급', price: '129000', sections: [s([v('기업 법무 직무 이해', 720), v('계약 검토 면접 시나리오', 840)], '1. 법무 직무'), s([v('분쟁 대응 케이스 면접', 900), v('법무 면접 실전 Q&A', 840)], '2. 케이스 면접')] },
    { title: '세무사·회계사 취업 면접 전략', description: '회계법인·세무법인 취업을 위한 실무 면접 준비와 전문직 커리어 설계 전략을 다룹니다.', category: '법률/회계', difficulty: '중급', price: '79000', sections: [s([v('회계법인 면접 특성 이해', 660), v('Big 4 vs 중소형 펌 전략', 720)], '1. 법인 취업'), s([v('세무 실무 면접 Q&A', 720), v('전문직 커리어 설계', 660)], '2. 실전 전략')] },
    { title: '준법감시·컴플라이언스 면접', description: '금융·제조·IT 기업 컴플라이언스 부서 채용 면접을 규정 해석·리스크 관리 관점으로 대비합니다.', category: '법률/회계', difficulty: '고급', price: '109000', sections: [s([v('컴플라이언스 직무 이해', 720), v('금융 규제 해석 면접', 840)], '1. 컴플라이언스'), s([v('리스크 관리 케이스 면접', 900), v('컴플라이언스 면접 Q&A', 780)], '2. 실전 케이스')] },
    { title: '회계·재무 직무 면접 완전 정복', description: '재무제표 분석·원가 회계·예산 관리 경험을 회계·재무 직군 면접 시나리오로 학습합니다.', category: '법률/회계', difficulty: '중급', price: '69000', sections: [s([v('재무제표 분석 면접', 780), v('원가·관리 회계 면접', 720)], '1. 회계 기초'), s([v('예산 수립 경험 어필', 660), v('회계 면접 실전 Q&A', 720)], '2. 실전 적용')] },
    { title: '계약 관리·법무 직무 면접', description: '계약서 검토·협상 경험·법무 문서 작성 역량을 면접에서 임팩트 있게 어필하는 전략을 다룹니다.', category: '법률/회계', difficulty: '중급', price: '59000', sections: [s([v('계약서 검토 프로세스', 660), v('협상 경험 스토리텔링', 720)], '1. 계약 관리'), s([v('법무 문서 작성 역량 어필', 660), v('계약·법무 면접 Q&A', 660)], '2. 실전 전략')] },
  ];

  const createdCourseIds: number[] = [];

  for (const seed of courseSeeds) {
    let course = await courseRepo.findOne({ where: { title: seed.title } });
    if (!course) {
      course = courseRepo.create({
        title: seed.title,
        description: seed.description,
        instructorId: instructor.id,
        category: seed.category,
        difficulty: seed.difficulty,
        price: seed.price,
        isPublished: true,
        thumbnailUrl: null,
      });
      await courseRepo.save(course);
      createdCourseIds.push(course.id);

      let sectionOrder = 1;
      for (const s of seed.sections) {
        const section = sectionRepo.create({
          courseId: course.id,
          title: s.title,
          sortOrder: sectionOrder++,
        });
        await sectionRepo.save(section);
        let videoOrder = 1;
        for (const v of s.videos) {
          const video = videoRepo.create({
            sectionId: section.id,
            title: v.title,
            videoUrl,
            durationSeconds: v.durationSeconds,
            sortOrder: videoOrder++,
          });
          await videoRepo.save(video);
        }
      }
    }
  }

  const totalCourses = await courseRepo.count({ where: { isPublished: true } });
  const courses = await courseRepo.find({
    where: { isPublished: true },
    order: { createdAt: 'DESC' },
    take: 12, // 장바구니/수강 대상 선정을 위한 샘플
  });

  // 장바구니: 2개 담기(중복/유니크 제약 고려)
  const cartTarget = courses.filter((c) => Number(c.price) > 0).slice(0, 2);
  for (const c of cartTarget) {
    const exists = await cartRepo.findOne({ where: { userId: student.id, courseId: c.id } });
    if (!exists) {
      try {
        await cartRepo.save(cartRepo.create({ userId: student.id, courseId: c.id }));
      } catch {
        // unique 충돌 등 무시
      }
    }
  }

  // 수강: 2개 등록 + 진도 생성(진도율/이어보기 데모)
  const enrollTarget = courses.slice(0, 2);
  for (const c of enrollTarget) {
    let enr = await enrollRepo.findOne({ where: { userId: student.id, courseId: c.id } });
    if (!enr) {
      try {
        enr = enrollRepo.create({ userId: student.id, courseId: c.id, status: 'active' });
        await enrollRepo.save(enr);
      } catch {
        // unique 충돌 무시
      }
    }
    if (!enr) continue;

    // 해당 강의 첫 영상에 60% 진행 저장
    const detail = await courseRepo.findOne({
      where: { id: c.id },
      relations: { sections: { videos: true } },
    });
    const firstVideo = detail?.sections?.[0]?.videos?.[0];
    if (firstVideo) {
      const existing = await progressRepo.findOne({
        where: { enrollmentId: enr.id, videoId: firstVideo.id },
      });
      if (!existing) {
        await progressRepo.save(
          progressRepo.create({
            enrollmentId: enr.id,
            videoId: firstVideo.id,
            lastSecond: Math.floor((firstVideo.durationSeconds || 0) * 0.6),
            completed: false,
          }),
        );
      }
    }
  }

  // Q&A: 첫 강의에 질문 2개 + 답변 1개
  const qaCourse = courses[0];
  if (qaCourse) {
    const existingQuestions = await questionRepo.count({
      where: { courseId: qaCourse.id },
    });
    if (existingQuestions === 0) {
      const q1 = questionRepo.create({
        courseId: qaCourse.id,
        userId: student.id,
        title: '커리큘럼 2장부터 들어도 되나요?',
        body: '선수 지식이 부족한데 2장부터 들어도 이해될까요?',
        isPrivate: false,
      });
      const q2 = questionRepo.create({
        courseId: qaCourse.id,
        userId: student.id,
        title: 'useCallback은 언제 쓰는 게 좋나요?',
        body: '무조건 쓰면 좋은 건지, 기준이 궁금합니다.',
        isPrivate: false,
      });
      await questionRepo.save([q1, q2]);

      const a1 = answerRepo.create({
        questionId: q2.id,
        userId: instructor.id,
        body: '자식 컴포넌트가 memo로 최적화되어 있고 콜백 참조가 리렌더링을 유발할 때 우선 고려하세요. 무조건은 아닙니다.',
      });
      await answerRepo.save(a1);
    }
  }

  console.log(
    `Seed done. courses_total=${totalCourses} (new=${createdCourseIds.length}, target=120+), cart=${cartTarget.length}, enroll=${enrollTarget.length}`,
  );

  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
