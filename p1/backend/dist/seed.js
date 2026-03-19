"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const course_entity_1 = require("./entities/course.entity");
const course_section_entity_1 = require("./entities/course-section.entity");
const course_video_entity_1 = require("./entities/course-video.entity");
const cart_item_entity_1 = require("./entities/cart-item.entity");
const enrollment_entity_1 = require("./entities/enrollment.entity");
const video_progress_entity_1 = require("./entities/video-progress.entity");
const question_entity_1 = require("./entities/question.entity");
const answer_entity_1 = require("./entities/answer.entity");
const bcrypt = require("bcryptjs");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'p1_interview',
    entities: [
        user_entity_1.User,
        course_entity_1.Course,
        course_section_entity_1.CourseSection,
        course_video_entity_1.CourseVideo,
        cart_item_entity_1.CartItem,
        enrollment_entity_1.Enrollment,
        video_progress_entity_1.VideoProgress,
        question_entity_1.Question,
        answer_entity_1.Answer,
    ],
    synchronize: false,
});
async function seed() {
    await dataSource.initialize();
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const courseRepo = dataSource.getRepository(course_entity_1.Course);
    const sectionRepo = dataSource.getRepository(course_section_entity_1.CourseSection);
    const videoRepo = dataSource.getRepository(course_video_entity_1.CourseVideo);
    const cartRepo = dataSource.getRepository(cart_item_entity_1.CartItem);
    const enrollRepo = dataSource.getRepository(enrollment_entity_1.Enrollment);
    const progressRepo = dataSource.getRepository(video_progress_entity_1.VideoProgress);
    const questionRepo = dataSource.getRepository(question_entity_1.Question);
    const answerRepo = dataSource.getRepository(answer_entity_1.Answer);
    const ensureUserId1 = async (fallback) => {
        let u = await userRepo.findOne({ where: { id: 1 } });
        if (u)
            return u;
        try {
            await userRepo.insert({ id: 1, ...fallback });
            u = await userRepo.findOne({ where: { id: 1 } });
            if (u)
                return u;
        }
        catch {
        }
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
    if (!student.passwordHash) {
        student.passwordHash = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10);
        await userRepo.save(student);
    }
    await dataSource.query(`SELECT setval(pg_get_serial_sequence('users','id'), (SELECT COALESCE(MAX(id), 1) FROM users))`);
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
    const baseSeeds = [
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
    const categories = ['기술면접', '인성면접', 'PT면접', '영어면접'];
    const difficulties = ['초급', '중급', '고급'];
    const prices = ['0', '19000', '29000', '39000', '49000', '59000', '69000', '79000', '89000', '99000', '129000'];
    const genSeeds = [];
    for (let i = 1; i <= 34; i++) {
        const category = categories[i % categories.length];
        const difficulty = difficulties[i % difficulties.length];
        const price = i % 7 === 0 ? '0' : prices[(i * 3) % prices.length];
        const tag = category === '기술면접'
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
    const courseSeeds = [...baseSeeds, ...genSeeds];
    const createdCourseIds = [];
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
        take: 12,
    });
    const cartTarget = courses.filter((c) => Number(c.price) > 0).slice(0, 2);
    for (const c of cartTarget) {
        const exists = await cartRepo.findOne({ where: { userId: student.id, courseId: c.id } });
        if (!exists) {
            try {
                await cartRepo.save(cartRepo.create({ userId: student.id, courseId: c.id }));
            }
            catch {
            }
        }
    }
    const enrollTarget = courses.slice(0, 2);
    for (const c of enrollTarget) {
        let enr = await enrollRepo.findOne({ where: { userId: student.id, courseId: c.id } });
        if (!enr) {
            try {
                enr = enrollRepo.create({ userId: student.id, courseId: c.id, status: 'active' });
                await enrollRepo.save(enr);
            }
            catch {
            }
        }
        if (!enr)
            continue;
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
                await progressRepo.save(progressRepo.create({
                    enrollmentId: enr.id,
                    videoId: firstVideo.id,
                    lastSecond: Math.floor((firstVideo.durationSeconds || 0) * 0.6),
                    completed: false,
                }));
            }
        }
    }
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
    console.log(`Seed done. courses_total=${totalCourses} (new=${createdCourseIds.length}), cart=${cartTarget.length}, enroll=${enrollTarget.length}`);
    await dataSource.destroy();
}
seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map