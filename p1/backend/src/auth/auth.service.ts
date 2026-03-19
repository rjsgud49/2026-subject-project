import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async login(body: { email: string; password: string }) {
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email) throw new BadRequestException('email은 필수입니다.');
    const password = String(body.password ?? '');
    if (!password) throw new BadRequestException('password는 필수입니다.');

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      if (!exists.passwordHash) {
        throw new UnauthorizedException('비밀번호가 설정되지 않은 계정입니다. 회원가입을 다시 진행해 주세요.');
      }
      const ok = await bcrypt.compare(password, exists.passwordHash);
      if (!ok) throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
      return { id: exists.id, email: exists.email, name: exists.name, role: exists.role };
    }

    // P1 간이 인증 정책:
    // - 회원가입(signup)에서만 계정을 생성한다.
    // - 로그인(login)은 존재하는 계정만 성공한다.
    throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  async signup(body: { email: string; name: string; password: string }) {
    const email = (body.email ?? '').trim().toLowerCase();
    const name = (body.name ?? '').trim();
    if (!email) throw new BadRequestException('email은 필수입니다.');
    if (!name) throw new BadRequestException('name은 필수입니다.');
    const password = String(body.password ?? '');
    if (!password) throw new BadRequestException('password는 필수입니다.');
    if (password.length < 4) throw new BadRequestException('password는 4자 이상이어야 합니다.');

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('이미 가입된 이메일입니다.');

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

  async me(userId?: number) {
    if (!userId) throw new BadRequestException('x-user-id 헤더가 필요합니다.');
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }
}

