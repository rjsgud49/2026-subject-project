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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../entities/course.entity");
let CoursesService = class CoursesService {
    constructor(courseRepo) {
        this.courseRepo = courseRepo;
    }
    async findAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const size = Math.min(100, Math.max(1, Number(query.size) || 12));
        const qb = this.courseRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.instructor', 'instructor')
            .where('c.isPublished = :pub', { pub: true });
        if (query.q?.trim()) {
            qb.andWhere('(c.title ILIKE :q OR c.description ILIKE :q)', {
                q: `%${query.q.trim()}%`,
            });
        }
        if (query.category) {
            qb.andWhere('c.category = :category', { category: query.category });
        }
        if (query.difficulty) {
            qb.andWhere('c.difficulty = :difficulty', { difficulty: query.difficulty });
        }
        if (query.min_price != null) {
            qb.andWhere('c.price >= :min_price', { min_price: query.min_price });
        }
        if (query.max_price != null) {
            qb.andWhere('c.price <= :max_price', { max_price: query.max_price });
        }
        switch (query.sort) {
            case 'price_asc':
                qb.orderBy('c.price', 'ASC');
                break;
            case 'price_desc':
                qb.orderBy('c.price', 'DESC');
                break;
            case 'popular':
                qb.orderBy('c.createdAt', 'DESC');
                break;
            default:
                qb.orderBy('c.createdAt', 'DESC');
        }
        const [items, total] = await qb
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
        return {
            items: items.map((c) => ({
                id: c.id,
                title: c.title,
                instructor_name: c.instructor?.name ?? '',
                category: c.category,
                difficulty: c.difficulty,
                price: Number(c.price),
                thumbnail_url: c.thumbnailUrl,
                created_at: c.createdAt,
            })),
            total,
            page,
            size,
        };
    }
    async findOne(id) {
        const course = await this.courseRepo.findOne({
            where: { id },
            relations: { instructor: true, sections: { videos: true } },
            order: { sections: { sortOrder: 'ASC', videos: { sortOrder: 'ASC' } } },
        });
        if (!course)
            throw new common_1.NotFoundException('강의를 찾을 수 없습니다.');
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            instructor_id: course.instructorId,
            instructor_name: course.instructor?.name ?? '',
            category: course.category,
            difficulty: course.difficulty,
            price: Number(course.price),
            thumbnail_url: course.thumbnailUrl,
            sections: (course.sections ?? []).map((s) => ({
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
            })),
        };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CoursesService);
//# sourceMappingURL=courses.service.js.map