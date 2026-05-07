import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Feedback } from './entities/feedback.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { TeacherRevenueLine } from './entities/teacher-revenue-line.entity';
import { splitEnrollmentRevenue } from './settlement.constants';

/** 데모용 짧은 샘플 영상 (외부 `<video src>`에서 200 응답 확인된 URL만 사용) */
const V = {
  flower:
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  bbb: 'https://www.w3schools.com/html/mov_bbb.mp4',
  /** gtv-videos-bucket 샘플은 최근 403이 많아, 대체 MP4만 사용 */
  sample640:
    'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
} as const;

type Vid = {
  id: number;
  title: string;
  duration: number;
  duration_seconds: number;
  video_url: string;
};

function vid(id: number, title: string, seconds: number, url: string): Vid {
  return {
    id,
    title,
    duration: seconds,
    duration_seconds: seconds,
    video_url: url,
  };
}

/** 제목별 풍부한 커리큘럼 — 강의 상세·수강 플레이어에서 바로 확인 가능 */
const CURRICULUM_BY_TITLE: Record<string, { sections: { id: number; title: string; videos: Vid[] }[] }> = {
  'TypeScript로 배우는 백엔드 기초': {
    sections: [
      {
        id: 1,
        title: '1부 · 오리엔테이션',
        videos: [
          vid(101, '강의 소개와 학습 로드맵', 300, V.flower),
          vid(102, 'TypeScript가 백엔드에서 쓰이는 이유', 420, V.bbb),
          vid(103, '로컬 환경 점검 (Node, 패키지 매니저)', 360, V.sample640),
        ],
      },
      {
        id: 2,
        title: '2부 · REST API 설계',
        videos: [
          vid(201, 'HTTP 메서드와 리소스 모델링', 540, V.bbb),
          vid(202, 'DTO·검증이 필요한 이유', 480, V.flower),
          vid(203, '에러 응답과 상태 코드 정리', 390, V.sample640),
        ],
      },
      {
        id: 3,
        title: '3부 · NestJS 맛보기',
        videos: [
          vid(301, '모듈·컨트롤러·서비스 구조', 600, V.flower),
          vid(302, '의존성 주입 흐름 따라가기', 510, V.bbb),
          vid(303, '간단한 CRUD 엔드포인트 만들기', 720, V.sample640),
        ],
      },
      {
        id: 4,
        title: '4부 · 인증 흐름',
        videos: [
          vid(401, '세션 vs 토큰 개념', 450, V.bbb),
          vid(402, 'JWT 구조와 서명', 480, V.flower),
          vid(403, '가드·역할 기반 접근 제어 아이디어', 540, V.sample640),
        ],
      },
    ],
  },
  'React 실전 컴포넌트 설계': {
    sections: [
      {
        id: 1,
        title: '1부 · 컴포넌트 기본기',
        videos: [
          vid(1101, '강의 범위와 실습 과제 안내', 280, V.flower),
          vid(1102, '컴포넌트 경계 나누기', 400, V.bbb),
          vid(1103, 'props·state 읽는 법', 350, V.sample640),
        ],
      },
      {
        id: 2,
        title: '2부 · 재사용과 합성',
        videos: [
          vid(1201, '슬롯 패턴과 children', 440, V.bbb),
          vid(1202, '작은 단위로 쪼개기', 380, V.flower),
          vid(1203, '스타일·레이아웃 일관성', 410, V.sample640),
        ],
      },
      {
        id: 3,
        title: '3부 · 접근성·폼',
        videos: [
          vid(1301, '키보드 포커스와 시맨틱 마크업', 520, V.flower),
          vid(1302, '폼 상태: 제어 vs 비제어', 460, V.bbb),
          vid(1303, '에러 메시지·힌트 UX', 330, V.sample640),
        ],
      },
      {
        id: 4,
        title: '4부 · 성능과 유지보수',
        videos: [
          vid(1401, '불필요한 리렌더 줄이기', 500, V.bbb),
          vid(1402, '메모이제이션은 언제 쓸까', 430, V.flower),
          vid(1403, '폴더 구조와 네이밍 규칙', 360, V.sample640),
        ],
      },
    ],
  },
  '(비공개) 신규 강의 준비 중': {
    sections: [
      {
        id: 1,
        title: '초안 · 커리큘럼 (비공개)',
        videos: [
          vid(9001, '플레이스홀더 소개', 180, V.flower),
          vid(9002, '추후 공개 예정 영상 자리', 240, V.bbb),
        ],
      },
    ],
  },
};

const DEFAULT_CURRICULUM = {
  sections: [
    {
      id: 1,
      title: '1강 · 시작하기',
      videos: [vid(1, '강의 소개', 300, V.flower)],
    },
  ],
};

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'p2_lms',
    entities: [
      User,
      Course,
      Enrollment,
      Feedback,
      Question,
      Answer,
      TeacherRevenueLine,
    ],
    synchronize: true,
  });
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const courseRepo = dataSource.getRepository(Course);
  const enrollRepo = dataSource.getRepository(Enrollment);
  const feedbackRepo = dataSource.getRepository(Feedback);
  const revenueRepo = dataSource.getRepository(TeacherRevenueLine);

  const hash = (p: string) => bcrypt.hash(p, 10);

  async function upsertUser(
    email: string,
    name: string,
    role: 'admin' | 'teacher' | 'student',
    password: string,
    bio?: string,
  ) {
    let u = await userRepo.findOne({ where: { email } });
    if (!u) {
      u = userRepo.create({
        email,
        name,
        role,
        passwordHash: await hash(password),
        bio: bio ?? null,
      });
      await userRepo.save(u);
    } else {
      u.name = name;
      u.role = role;
      u.passwordHash = await hash(password);
      if (bio !== undefined) u.bio = bio;
      await userRepo.save(u);
    }
    return u;
  }

  const admin = await upsertUser(
    'admin@p2.local',
    '시스템 관리자',
    'admin',
    'admin123',
    '플랫폼 전체 운영',
  );
  const teacher = await upsertUser(
    'teacher@p2.local',
    '김강사',
    'teacher',
    'teacher123',
    '풀스택 강의 10년 경력',
  );
  const student = await upsertUser(
    'student@p2.local',
    '이학생',
    'student',
    'student123',
  );

  const seeds = [
    {
      title: 'TypeScript로 배우는 백엔드 기초',
      description: 'NestJS·REST API·인증 흐름을 한 번에.',
      price: 49000,
      published: true,
    },
    {
      title: 'React 실전 컴포넌트 설계',
      description: '접근성과 재사용을 고려한 UI 패턴.',
      price: 59000,
      published: true,
    },
    {
      title: '(비공개) 신규 강의 준비 중',
      description: '강사만 보는 초안 강의입니다.',
      price: 0,
      published: false,
    },
  ];

  for (const s of seeds) {
    const exists = await courseRepo.findOne({
      where: { title: s.title, instructorId: teacher.id },
    });
    const curriculum =
      CURRICULUM_BY_TITLE[s.title] ?? DEFAULT_CURRICULUM;
    if (!exists) {
      await courseRepo.save(
        courseRepo.create({
          title: s.title,
          description: s.description,
          price: s.price,
          instructorId: teacher.id,
          isPublished: s.published,
          curriculumJson: JSON.stringify(curriculum),
        }),
      );
    }
  }

  const teacherCourses = await courseRepo.find({
    where: { instructorId: teacher.id },
  });
  for (const c of teacherCourses) {
    const rich = CURRICULUM_BY_TITLE[c.title];
    if (rich) {
      c.curriculumJson = JSON.stringify(rich);
      await courseRepo.save(c);
    } else if (!c.curriculumJson) {
      c.curriculumJson = JSON.stringify(DEFAULT_CURRICULUM);
      await courseRepo.save(c);
    }
  }

  const pub = await courseRepo.findOne({
    where: { instructorId: teacher.id, isPublished: true },
  });
  if (pub) {
    const has = await enrollRepo.findOne({
      where: { userId: student.id, courseId: pub.id },
    });
    if (!has) {
      await enrollRepo.save(
        enrollRepo.create({ userId: student.id, courseId: pub.id }),
      );
    }
  }

  const enrollmentsAll = await enrollRepo.find({ relations: ['course'] });
  for (const en of enrollmentsAll) {
    const exists = await revenueRepo.findOne({
      where: { enrollmentId: en.id },
    });
    if (exists || !en.course) continue;
    const { gross, platformFee, net } = splitEnrollmentRevenue(en.course.price);
    await revenueRepo.save(
      revenueRepo.create({
        teacherId: en.course.instructorId,
        courseId: en.courseId,
        enrollmentId: en.id,
        priceSnapshot: en.course.price,
        grossAmount: gross,
        platformFee,
        netAmount: net,
        enrolledAt: en.enrolledAt,
      }),
    );
  }

  const fbExists = await feedbackRepo.findOne({
    where: { studentId: student.id, title: '포트폴리오 면접 피드백 요청' },
  });
  if (!fbExists) {
    await feedbackRepo.save(
      feedbackRepo.create({
        studentId: student.id,
        teacherId: teacher.id,
        title: '포트폴리오 면접 피드백 요청',
        studentQuestion:
          '프로젝트 설명에서 임팩트를 더 보여주려면 어떤 순서로 말하는 게 좋을까요?',
        teacherQuestion:
          '지원 직무 기준으로 핵심 성과 수치를 먼저 말할 수 있나요?',
        teacherFeedback:
          'STAR 구조로 답변을 재정리하세요. Situation을 1문장으로 줄이고, Action에서 본인이 주도한 기술적 선택을 강조하면 좋습니다.',
        status: 'answered',
      }),
    );
  }

  console.log('P2 seed OK', {
    admin: admin.email,
    teacher: teacher.email,
    student: student.email,
  });
  await dataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
