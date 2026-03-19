"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const video_progress_entity_1 = require("../entities/video-progress.entity");
const course_video_entity_1 = require("../entities/course-video.entity");
const cart_item_entity_1 = require("../entities/cart-item.entity");
let EnrollmentsService = class EnrollmentsService {
    constructor(enrollmentRepo, progressRepo, videoRepo, cartRepo) {
        this.enrollmentRepo = enrollmentRepo;
        this.progressRepo = progressRepo;
        this.videoRepo = videoRepo;
        this.cartRepo = cartRepo;
    }
    async findAll(userId, status) {
        const qb = this.enrollmentRepo
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.course', 'c')
            .where('e.userId = :userId', { userId });
        if (status)
            qb.andWhere('e.status = :status', { status });
        qb.orderBy('e.enrolledAt', 'DESC');
        const list = await qb.getMany();
        const result = await Promise.all(list.map(async (e) => {
            const progress = await this.getProgressPercent(e.id);
            const last = await this.progressRepo.findOne({
                where: { enrollmentId: e.id },
                order: { updatedAt: 'DESC' },
            });
            return {
                id: e.id,
                course_id: e.courseId,
                course_title: e.course?.title ?? '',
                thumbnail_url: e.course?.thumbnailUrl ?? '',
                progress_percent: progress.percent,
                status: e.status,
                last_video_id: last?.videoId ?? null,
                last_second: last?.lastSecond ?? null,
            };
        }));
        return result;
    }
    async getProgressPercent(enrollmentId) {
        const enrollment = await this.enrollmentRepo.findOne({
            where: { id: enrollmentId },
            relations: { course: { sections: { videos: true } } },
        });
        if (!enrollment?.course)
            return { percent: 0 };
        const total = enrollment.course.sections?.reduce((sum, s) => sum + (s.videos?.length ?? 0), 0) ?? 0;
        if (total === 0)
            return { percent: 100 };
        const completed = await this.progressRepo.count({
            where: { enrollmentId, completed: true },
        });
        return { percent: Math.round((completed / total) * 100) };
    }
    async findOne(enrollmentId, userId) {
        const e = await this.enrollmentRepo.findOne({
            where: { id: enrollmentId, userId },
            relations: { course: { instructor: true, sections: { videos: true } } },
        });
        if (!e)
            throw new common_1.NotFoundException('수강 정보를 찾을 수 없습니다.');
        const progress = await this.getProgressPercent(e.id);
        const last = await this.progressRepo.findOne({
            where: { enrollmentId: e.id },
            order: { updatedAt: 'DESC' },
        });
        const course = e.course;
        const sections = (course?.sections ?? []).map((s) => ({
            id: s.id,
            title: s.title,
            sort_order: s.sortOrder,
            videos: (s.videos ?? []).map((v) => ({
                id: v.id,
                title: v.title,
                video_url: v.videoUrl,
                duration_seconds: v.durationSeconds,
                sort_order: v.sortOrder,
            })),
        }));
        return {
            id: e.id,
            course: {
                id: course?.id,
                title: course?.title,
                description: course?.description,
                instructor_name: course?.instructor?.name,
                category: course?.category,
                difficulty: course?.difficulty,
                price: course ? Number(course.price) : 0,
                thumbnail_url: course?.thumbnailUrl,
                sections,
            },
            last_video_id: last?.videoId ?? null,
            last_second: last?.lastSecond ?? null,
            progress_percent: progress.percent,
        };
    }
    async enroll(userId, courseId) {
        const existing = await this.enrollmentRepo.findOne({
            where: { userId, courseId },
        });
        if (existing)
            throw new common_1.ConflictException('이미 수강 중인 강의입니다.');
        const enrollment = this.enrollmentRepo.create({
            userId,
            courseId,
            status: 'active',
        });
        await this.enrollmentRepo.save(enrollment);
        await this.cartRepo.delete({ userId, courseId });
        return { id: enrollment.id };
    }
    async getProgress(enrollmentId, userId) {
        const e = await this.enrollmentRepo.findOne({
            where: { id: enrollmentId, userId },
        });
        if (!e)
            throw new common_1.NotFoundException('수강 정보를 찾을 수 없습니다.');
        const list = await this.progressRepo.find({
            where: { enrollmentId },
            relations: { video: true },
        });
        return list.map((p) => ({
            video_id: p.videoId,
            last_second: p.lastSecond,
            completed: p.completed,
            updated_at: p.updatedAt,
        }));
    }
    async upsertProgress(enrollmentId, userId, videoId, body) {
        const e = await this.enrollmentRepo.findOne({
            where: { id: enrollmentId, userId },
        });
        if (!e)
            throw new common_1.NotFoundException('수강 정보를 찾을 수 없습니다.');
        let row = await this.progressRepo.findOne({
            where: { enrollmentId, videoId },
        });
        if (!row) {
            row = this.progressRepo.create({ enrollmentId, videoId });
        }
        if (body.last_second != null)
            row.lastSecond = body.last_second;
        if (body.completed != null)
            row.completed = body.completed;
        await this.progressRepo.save(row);
        const total = await this.videoRepo
            .createQueryBuilder('v')
            .innerJoin('v.section', 's')
            .innerJoin('s.course', 'c')
            .where('c.id = :courseId', { courseId: e.courseId })
            .getCount();
        const completed = await this.progressRepo.count({
            where: { enrollmentId, completed: true },
        });
        if (total > 0 && completed >= total) {
            await this.enrollmentRepo.update({ id: enrollmentId }, { status: 'completed' });
        }
        return { success: true };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __param(1, (0, typeorm_1.InjectRepository)(video_progress_entity_1.VideoProgress)),
    __param(2, (0, typeorm_1.InjectRepository)(course_video_entity_1.CourseVideo)),
    __param(3, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map