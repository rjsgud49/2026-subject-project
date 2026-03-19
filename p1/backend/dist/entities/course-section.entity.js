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
exports.CourseSection = void 0;
const typeorm_1 = require("typeorm");
const course_entity_1 = require("./course.entity");
const course_video_entity_1 = require("./course-video.entity");
let CourseSection = class CourseSection {
};
exports.CourseSection = CourseSection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { type: 'bigint' }),
    __metadata("design:type", Number)
], CourseSection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'course_id', type: 'bigint' }),
    __metadata("design:type", Number)
], CourseSection.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, (c) => c.sections, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], CourseSection.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], CourseSection.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CourseSection.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_video_entity_1.CourseVideo, (v) => v.section),
    __metadata("design:type", Array)
], CourseSection.prototype, "videos", void 0);
exports.CourseSection = CourseSection = __decorate([
    (0, typeorm_1.Entity)('course_sections')
], CourseSection);
//# sourceMappingURL=course-section.entity.js.map