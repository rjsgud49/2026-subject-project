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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const question_entity_1 = require("../entities/question.entity");
const answer_entity_1 = require("../entities/answer.entity");
let QuestionsService = class QuestionsService {
    constructor(questionRepo, answerRepo) {
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
    }
    async findByCourse(courseId, page = 1, size = 20) {
        const [items, total] = await this.questionRepo.findAndCount({
            where: { courseId },
            relations: { user: true },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * size,
            take: size,
        });
        const withCount = await Promise.all(items.map(async (q) => {
            const answerCount = await this.answerRepo.count({
                where: { questionId: q.id },
            });
            return {
                id: q.id,
                title: q.title,
                user_name: q.user?.name ?? '',
                answer_count: answerCount,
                created_at: q.createdAt,
            };
        }));
        return { items: withCount, total };
    }
    async findOne(questionId) {
        const question = await this.questionRepo.findOne({
            where: { id: questionId },
            relations: { user: true, answers: { user: true } },
            order: { answers: { createdAt: 'ASC' } },
        });
        if (!question)
            throw new common_1.NotFoundException('질문을 찾을 수 없습니다.');
        return {
            question: {
                id: question.id,
                course_id: question.courseId,
                title: question.title,
                body: question.body,
                user_id: question.userId,
                user_name: question.user?.name ?? '',
                created_at: question.createdAt,
            },
            answers: (question.answers ?? []).map((a) => ({
                id: a.id,
                body: a.body,
                user_name: a.user?.name ?? '',
                created_at: a.createdAt,
            })),
        };
    }
    async create(courseId, userId, body) {
        const q = this.questionRepo.create({
            courseId,
            userId,
            title: body.title,
            body: body.body,
            isPrivate: body.is_private ?? false,
        });
        await this.questionRepo.save(q);
        return {
            id: q.id,
            course_id: q.courseId,
            title: q.title,
            body: q.body,
            user_id: q.userId,
            user_name: '',
            created_at: q.createdAt,
        };
    }
    async update(questionId, userId, body) {
        const q = await this.questionRepo.findOne({ where: { id: questionId } });
        if (!q)
            throw new common_1.NotFoundException('질문을 찾을 수 없습니다.');
        if (q.userId !== userId)
            throw new common_1.ForbiddenException('본인만 수정할 수 있습니다.');
        if (body.title != null)
            q.title = body.title;
        if (body.body != null)
            q.body = body.body;
        await this.questionRepo.save(q);
        return { success: true };
    }
    async remove(questionId, userId) {
        const q = await this.questionRepo.findOne({ where: { id: questionId } });
        if (!q)
            throw new common_1.NotFoundException('질문을 찾을 수 없습니다.');
        if (q.userId !== userId)
            throw new common_1.ForbiddenException('본인만 삭제할 수 있습니다.');
        await this.questionRepo.remove(q);
    }
    async createAnswer(questionId, userId, body) {
        const question = await this.questionRepo.findOne({
            where: { id: questionId },
        });
        if (!question)
            throw new common_1.NotFoundException('질문을 찾을 수 없습니다.');
        const a = this.answerRepo.create({
            questionId,
            userId,
            body: body.body,
        });
        await this.answerRepo.save(a);
        return { id: a.id };
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(answer_entity_1.Answer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map