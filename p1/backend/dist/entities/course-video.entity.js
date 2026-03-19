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
exports.CourseVideo = void 0;
const typeorm_1 = require("typeorm");
const course_section_entity_1 = require("./course-section.entity");
let CourseVideo = class CourseVideo {
};
exports.CourseVideo = CourseVideo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { type: 'bigint' }),
    __metadata("design:type", Number)
], CourseVideo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'section_id', type: 'bigint' }),
    __metadata("design:type", Number)
], CourseVideo.prototype, "sectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_section_entity_1.CourseSection, (s) => s.videos, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'section_id' }),
    __metadata("design:type", course_section_entity_1.CourseSection)
], CourseVideo.prototype, "section", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], CourseVideo.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'video_url', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], CourseVideo.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_seconds', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CourseVideo.prototype, "durationSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CourseVideo.prototype, "sortOrder", void 0);
exports.CourseVideo = CourseVideo = __decorate([
    (0, typeorm_1.Entity)('course_videos')
], CourseVideo);
//# sourceMappingURL=course-video.entity.js.map