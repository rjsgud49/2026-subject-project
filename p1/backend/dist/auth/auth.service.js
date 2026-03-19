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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async login(body) {
        const email = (body.email ?? '').trim().toLowerCase();
        if (!email)
            throw new common_1.BadRequestException('email은 필수입니다.');
        const password = String(body.password ?? '');
        if (!password)
            throw new common_1.BadRequestException('password는 필수입니다.');
        const exists = await this.userRepo.findOne({ where: { email } });
        if (exists) {
            if (!exists.passwordHash) {
                throw new common_1.UnauthorizedException('비밀번호가 설정되지 않은 계정입니다. 회원가입을 다시 진행해 주세요.');
            }
            const ok = await bcrypt.compare(password, exists.passwordHash);
            if (!ok)
                throw new common_1.UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
            return { id: exists.id, email: exists.email, name: exists.name, role: exists.role };
        }
        throw new common_1.UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    async signup(body) {
        const email = (body.email ?? '').trim().toLowerCase();
        const name = (body.name ?? '').trim();
        if (!email)
            throw new common_1.BadRequestException('email은 필수입니다.');
        if (!name)
            throw new common_1.BadRequestException('name은 필수입니다.');
        const password = String(body.password ?? '');
        if (!password)
            throw new common_1.BadRequestException('password는 필수입니다.');
        if (password.length < 4)
            throw new common_1.BadRequestException('password는 4자 이상이어야 합니다.');
        const exists = await this.userRepo.findOne({ where: { email } });
        if (exists)
            throw new common_1.ConflictException('이미 가입된 이메일입니다.');
        const passwordHash = await bcrypt.hash(password, 10);
        const u = this.userRepo.create({
            email,
            name,
            role: 'student',
            passwordHash,
        });
        await this.userRepo.save(u);
        return { id: u.id, email: u.email, name: u.name, role: u.role };
    }
    async me(userId) {
        if (!userId)
            throw new common_1.BadRequestException('x-user-id 헤더가 필요합니다.');
        const u = await this.userRepo.findOne({ where: { id: userId } });
        if (!u)
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        return { id: u.id, email: u.email, name: u.name, role: u.role };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map