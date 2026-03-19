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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_item_entity_1 = require("../entities/cart-item.entity");
const enrollment_entity_1 = require("../entities/enrollment.entity");
let CartService = class CartService {
    constructor(cartRepo, enrollmentRepo) {
        this.cartRepo = cartRepo;
        this.enrollmentRepo = enrollmentRepo;
    }
    async findAll(userId) {
        const items = await this.cartRepo.find({
            where: { userId },
            relations: { course: true },
            order: { addedAt: 'DESC' },
        });
        return items.map((i) => ({
            id: i.id,
            course_id: i.courseId,
            course_title: i.course?.title ?? '',
            price: Number(i.course?.price ?? 0),
            added_at: i.addedAt,
        }));
    }
    async add(userId, courseId) {
        const existing = await this.enrollmentRepo.findOne({
            where: { userId, courseId },
        });
        if (existing)
            throw new common_1.ConflictException('이미 수강 중인 강의입니다.');
        const inCart = await this.cartRepo.findOne({
            where: { userId, courseId },
        });
        if (inCart)
            throw new common_1.ConflictException('이미 장바구니에 있습니다.');
        const item = this.cartRepo.create({ userId, courseId });
        await this.cartRepo.save(item);
        return { success: true };
    }
    async remove(userId, courseId) {
        await this.cartRepo.delete({ userId, courseId });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(1, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map