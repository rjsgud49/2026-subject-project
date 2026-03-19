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
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const enrollments_service_1 = require("./enrollments.service");
let EnrollmentsController = class EnrollmentsController {
    constructor(enrollmentsService) {
        this.enrollmentsService = enrollmentsService;
    }
    getUserId(req) {
        const id = req.headers['x-user-id'];
        return id ? parseInt(id, 10) : 1;
    }
    findAll(req, status) {
        return this.enrollmentsService.findAll(this.getUserId(req), status);
    }
    enroll(req, courseId) {
        return this.enrollmentsService.enroll(this.getUserId(req), courseId);
    }
    findOne(req, enrollmentId) {
        return this.enrollmentsService.findOne(enrollmentId, this.getUserId(req));
    }
    getProgress(req, enrollmentId) {
        return this.enrollmentsService.getProgress(enrollmentId, this.getUserId(req));
    }
    async updateProgress(req, enrollmentId, videoId, body) {
        return this.enrollmentsService.upsertProgress(enrollmentId, this.getUserId(req), videoId, body);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('course_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)(':enrollmentId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('enrollmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':enrollmentId/progress'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('enrollmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Put)(':enrollmentId/videos/:videoId/progress'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('enrollmentId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('videoId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentsController.prototype, "updateProgress", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, common_1.Controller)('enrollments'),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService])
], EnrollmentsController);
//# sourceMappingURL=enrollments.controller.js.map