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
exports.QuestionsController = void 0;
const common_1 = require("@nestjs/common");
const questions_service_1 = require("./questions.service");
let QuestionsController = class QuestionsController {
    constructor(questionsService) {
        this.questionsService = questionsService;
    }
    getUserId(req) {
        const id = req.headers['x-user-id'];
        return id ? parseInt(id, 10) : 1;
    }
    findByCourse(courseId, page, size) {
        return this.questionsService.findByCourse(courseId, page ? parseInt(page, 10) : 1, size ? parseInt(size, 10) : 20);
    }
    create(req, courseId, body) {
        return this.questionsService.create(courseId, this.getUserId(req), body);
    }
    findOne(questionId) {
        return this.questionsService.findOne(questionId);
    }
    update(req, questionId, body) {
        return this.questionsService.update(questionId, this.getUserId(req), body);
    }
    async remove(req, questionId) {
        await this.questionsService.remove(questionId, this.getUserId(req));
    }
    createAnswer(req, questionId, body) {
        return this.questionsService.createAnswer(questionId, this.getUserId(req), body);
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, common_1.Get)('courses/:courseId/questions'),
    __param(0, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Post)('courses/:courseId/questions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('questions/:questionId'),
    __param(0, (0, common_1.Param)('questionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('questions/:questionId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('questionId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('questions/:questionId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('questionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('questions/:questionId/answers'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('questionId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", void 0)
], QuestionsController.prototype, "createAnswer", null);
exports.QuestionsController = QuestionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [questions_service_1.QuestionsService])
], QuestionsController);
//# sourceMappingURL=questions.controller.js.map