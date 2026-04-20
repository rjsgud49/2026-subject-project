import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Feedback } from './entities/feedback.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';

const DEFAULT_CURRICULUM = {
  sections: [
    {
      title: '1강 · 시작하기',
      videos: [
        {
          id: 1,
          title: '강의 소개',
          duration: 300,
          video_url:
            'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        },
      ],
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
    entities: [User, Course, Enrollment, Feedback, Question, Answer],
    synchronize: true,
  });
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const courseRepo = dataSource.getRepository(Course);
  const enrollRepo = dataSource.getRepository(Enrollment);
  const feedbackRepo = dataSource.getRepository(Feedback);

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
    if (!exists) {
      await courseRepo.save(
        courseRepo.create({
          title: s.title,
          description: s.description,
          price: s.price,
          instructorId: teacher.id,
          isPublished: s.published,
          curriculumJson: JSON.stringify(DEFAULT_CURRICULUM),
        }),
      );
    }
  }

  const teacherCourses = await courseRepo.find({
    where: { instructorId: teacher.id },
  });
  for (const c of teacherCourses) {
    if (!c.curriculumJson) {
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
