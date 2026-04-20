import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private sign(user: User) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string) {
    const em = (email ?? '').trim().toLowerCase();
    if (!em) throw new BadRequestException('이메일을 입력해 주세요.');
    const pwd = String(password ?? '');
    if (!pwd) throw new BadRequestException('비밀번호를 입력해 주세요.');

    const user = await this.userRepo.findOne({ where: { email: em } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    const ok = await bcrypt.compare(pwd, user.passwordHash);
    if (!ok)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    return this.sign(user);
  }

  async signup(
    email: string,
    name: string,
    password: string,
    roleInput?: string,
  ) {
    const em = (email ?? '').trim().toLowerCase();
    const nm = (name ?? '').trim();
    if (!em) throw new BadRequestException('이메일을 입력해 주세요.');
    if (!nm) throw new BadRequestException('이름을 입력해 주세요.');
    const pwd = String(password ?? '');
    if (pwd.length < 4)
      throw new BadRequestException('비밀번호는 4자 이상이어야 합니다.');

    const exists = await this.userRepo.findOne({ where: { email: em } });
    if (exists) throw new ConflictException('이미 가입된 이메일입니다.');

    const passwordHash = await bcrypt.hash(pwd, 10);
    const role: UserRole = roleInput === 'teacher' ? 'teacher' : 'student';
    const u = this.userRepo.create({ email: em, name: nm, role, passwordHash });
    await this.userRepo.save(u);
    return this.sign(u);
  }

  async me(userId: number) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new BadRequestException('사용자를 찾을 수 없습니다.');
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      bio: u.bio,
      settlement_bank: u.settlementBankName ?? null,
      settlement_account_no: u.settlementAccountNo ?? null,
      settlement_holder: u.settlementHolderName ?? null,
    };
  }
}
