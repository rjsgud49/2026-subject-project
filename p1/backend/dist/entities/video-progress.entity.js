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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProgress = void 0;
const typeorm_1 = require("typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const course_video_entity_1 = require("./course-video.entity");
let VideoProgress = class VideoProgress {
};
exports.VideoProgress = VideoProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { type: 'bigint' }),
    __metadata("design:type", Number)
], VideoProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enrollment_id', type: 'bigint' }),
    __metadata("design:type", Number)
], VideoProgress.prototype, "enrollmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => enrollment_entity_1.Enrollment, (e) => e.videoProgress, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'enrollment_id' }),
    __metadata("design:type", enrollment_entity_1.Enrollment)
], VideoProgress.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'video_id', type: 'bigint' }),
    __metadata("design:type", Number)
], VideoProgress.prototype, "videoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_video_entity_1.CourseVideo, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'video_id' }),
    __metadata("design:type", course_video_entity_1.CourseVideo)
], VideoProgress.prototype, "video", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_second', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], VideoProgress.prototype, "lastSecond", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], VideoProgress.prototype, "completed", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VideoProgress.prototype, "updatedAt", void 0);
exports.VideoProgress = VideoProgress = __decorate([
    (0, typeorm_1.Entity)('video_progress'),
    (0, typeorm_1.Unique)(['enrollmentId', 'videoId'])
], VideoProgress);
//# sourceMappingURL=video-progress.entity.js.map