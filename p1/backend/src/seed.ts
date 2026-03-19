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

  let instructor = await userRepo.findOne({ where: { email: 'instructor@p1.local' } });
  if (!instructor) {
    instructor = userRepo.create({
      name: '김민준',
      email: 'instructor@p1.local',
      role: 'instructor',
    });
    await userRepo.save(instructor);
  }
  if (instructor && !instructor.passwordHash) {
    instructor.passwordHash = await bcrypt.hash(DEFAULT_INSTRUCTOR_PASSWORD, 10);
    await userRepo.save(instructor);
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

  const baseSeeds: CourseSeed[] = [
    {
      title: 'React 기술면접 실전 대비',
      description: 'React·Hooks·렌더링 최적화·상태 관리까지, 기술면접 단골 질문을 실전 답변으로 정리합니다.',
      category: '기술면접',
      difficulty: '중급',
      price: '89000',
      sections: [
        {
          title: '1. React 핵심 개념',
          videos: [
            { title: 'Virtual DOM과 Reconciliation', durationSeconds: 600 },
            { title: 'Hooks useState / useEffect', durationSeconds: 900 },
          ],
        },
        {
          title: '2. 성능 최적화',
          videos: [
            { title: 'memo / useMemo / useCallback', durationSeconds: 780 },
            { title: '리렌더링 디버깅 전략', durationSeconds: 720 },
          ],
        },
      ],
    },
    {
      title: '인성면접 답변 구조화 마스터',
      description: 'STAR 기법과 나만의 스토리라인으로 인성면접 답변을 구조화합니다.',
      category: '인성면접',
      difficulty: '초급',
      price: '0',
      sections: [
        {
          title: '1. 인성면접의 기본',
          videos: [
            { title: '자기소개 30초/1분 템플릿', durationSeconds: 420 },
            { title: '지원동기 설계', durationSeconds: 540 },
          ],
        },
      ],
    },
    {
      title: 'PT 면접 10분 스피치',
      description: '10분 PT를 위한 구조(문제-원인-해결-효과)와 발표 전달력을 훈련합니다.',
      category: 'PT면접',
      difficulty: '고급',
      price: '129000',
      sections: [
        {
          title: '1. PT 구성',
          videos: [
            { title: 'PT 구조 잡기', durationSeconds: 600 },
            { title: 'Q&A 대응', durationSeconds: 480 },
          ],
        },
      ],
    },
    {
      title: '영어면접 필수 표현 100',
      description: '자주 쓰는 자기소개/경력/프로젝트 표현을 상황별로 정리합니다.',
      category: '영어면접',
      difficulty: '초급',
      price: '39000',
      sections: [
        { title: '1. 기본 표현', videos: [{ title: 'Tell me about yourself', durationSeconds: 300 }] },
        { title: '2. 프로젝트 설명', videos: [{ title: 'What I built and why', durationSeconds: 420 }] },
      ],
    },
    {
      title: '백엔드 기술면접 (Node.js/DB)',
      description: 'Node.js 이벤트 루프와 DB 트랜잭션/인덱스 등 핵심을 짚습니다.',
      category: '기술면접',
      difficulty: '중급',
      price: '59000',
      sections: [
        { title: '1. Node.js', videos: [{ title: 'Event loop', durationSeconds: 540 }] },
        { title: '2. Database', videos: [{ title: 'Index & Transaction', durationSeconds: 660 }] },
      ],
    },
    {
      title: '면접 합격을 부르는 이력서',
      description: '문장 다듬기, 프로젝트 임팩트 정리, 포트폴리오 구성까지 한 번에.',
      category: '인성면접',
      difficulty: '중급',
      price: '49000',
      sections: [
        { title: '1. 이력서', videos: [{ title: '프로젝트 임팩트 작성', durationSeconds: 600 }] },
      ],
    },
  ];

  // 40개 수준으로 자동 생성 (카테고리/난이도/가격 분포 섞기)
  const categories = ['기술면접', '인성면접', 'PT면접', '영어면접'];
  const difficulties = ['초급', '중급', '고급'];
  const prices = ['0', '19000', '29000', '39000', '49000', '59000', '69000', '79000', '89000', '99000', '129000'];

  const genSeeds: CourseSeed[] = [];
  for (let i = 1; i <= 34; i++) {
    const category = categories[i % categories.length];
    const difficulty = difficulties[i % difficulties.length];
    const price = i % 7 === 0 ? '0' : prices[(i * 3) % prices.length]; // 약 14% 무료
    const tag =
      category === '기술면접'
        ? '기술'
        : category === '인성면접'
          ? '인성'
          : category === 'PT면접'
            ? 'PT'
            : '영어';

    const title = `${tag} 면접 핵심 ${i}편 (${difficulty})`;
    genSeeds.push({
      title,
      description: `${tag} 면접에서 자주 나오는 질문을 ${difficulty} 난이도에 맞춰 정리한 강의입니다. 핵심 개념→예시 답변→실전 팁 순으로 구성됩니다.`,
      category,
      difficulty,
      price,
      sections: [
        {
          title: `1. ${tag} 기본 개념`,
          videos: [
            { title: `${tag} 자주 묻는 질문 TOP 10`, durationSeconds: 420 + (i % 5) * 60 },
            { title: `${tag} 답변 구조 만들기`, durationSeconds: 540 + (i % 4) * 60 },
          ],
        },
        {
          title: `2. 실전 대비`,
          videos: [
            { title: `실전 모의 질문 ${i}개 풀이`, durationSeconds: 600 + (i % 6) * 60 },
          ],
        },
      ],
    });
  }

  const courseSeeds: CourseSeed[] = [...baseSeeds, ...genSeeds]; // 총 40개(6+34)

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
    `Seed done. courses_total=${totalCourses} (new=${createdCourseIds.length}), cart=${cartTarget.length}, enroll=${enrollTarget.length}`,
  );

  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
