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
import { randomBytes } from 'crypto';
import { sendTransactionalEmail } from '../common/mail.util';
import { User, UserRole } from '../entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';
import { SignupDto } from './dto/signup.dto';

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

  async signup(dto: SignupDto) {
    const em = (dto.email ?? '').trim().toLowerCase();
    const nm = (dto.name ?? '').trim();
    if (!em) throw new BadRequestException('이메일을 입력해 주세요.');
    if (!nm || nm.length < 2)
      throw new BadRequestException('이름은 2자 이상 입력해 주세요.');

    const role: UserRole = dto.role === 'teacher' ? 'teacher' : 'student';
    const pwd = String(dto.password ?? '');

    if (role === 'student') {
      if (pwd.length < 4)
        throw new BadRequestException('비밀번호는 4자 이상이어야 합니다.');
    } else {
      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pwd)) {
        throw new BadRequestException(
          '강사 비밀번호는 8자 이상, 영문·숫자를 각각 1자 이상 포함해야 합니다.',
        );
      }
      if (!dto.agree_terms || !dto.agree_privacy || !dto.agree_settlement) {
        throw new BadRequestException('필수 약관에 모두 동의해 주세요.');
      }
      const phone = (dto.phone ?? '').replace(/\s/g, '');
      if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone)) {
        throw new BadRequestException('휴대폰 번호 형식이 올바르지 않습니다.');
      }
      const bio = (dto.bio ?? '').trim();
      if (bio.length < 30) {
        throw new BadRequestException('강사 소개는 30자 이상 작성해 주세요.');
      }
      if (!(dto.teacher_expertise ?? '').trim()) {
        throw new BadRequestException('주요 강의 분야를 선택해 주세요.');
      }
      if (
        !(dto.settlement_bank ?? '').trim() ||
        !(dto.settlement_account_no ?? '').trim() ||
        !(dto.settlement_holder ?? '').trim()
      ) {
        throw new BadRequestException('정산 계좌 정보를 모두 입력해 주세요.');
      }
    }

    const exists = await this.userRepo.findOne({ where: { email: em } });
    if (exists) throw new ConflictException('이미 가입된 이메일입니다.');

    const passwordHash = await bcrypt.hash(pwd, 10);

    if (role === 'teacher') {
      const phoneNorm = (dto.phone ?? '').replace(/\s/g, '');
      const u = this.userRepo.create({
        email: em,
        name: nm,
        role,
        passwordHash,
        phone: phoneNorm,
        teacherExpertise: dto.teacher_expertise!.trim(),
        bio: dto.bio!.trim(),
        settlementBankName: dto.settlement_bank!.trim(),
        settlementAccountNo: dto.settlement_account_no!.trim(),
        settlementHolderName: dto.settlement_holder!.trim(),
      });
      await this.userRepo.save(u);
      return this.sign(u);
    }

    const u = this.userRepo.create({ email: em, name: nm, role, passwordHash });
    await this.userRepo.save(u);
    return this.sign(u);
  }

  async forgotPassword(email: string) {
    const em = (email ?? '').trim().toLowerCase();
    if (!em) throw new BadRequestException('이메일을 입력해 주세요.');

    const user = await this.userRepo.findOne({ where: { email: em } });
    if (user?.passwordHash) {
      const token = randomBytes(32).toString('hex');
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await this.userRepo.save(user);

      const base = (process.env.CORS_ORIGIN ?? 'http://localhost:5174').replace(
        /\/$/,
        '',
      );
      const link = `${base}/reset-password?token=${encodeURIComponent(token)}`;
      await sendTransactionalEmail(
        em,
        '[면접인강] 비밀번호 재설정',
        `아래 링크에서 비밀번호를 재설정할 수 있습니다 (1시간 유효).\n\n${link}`,
      );
    }

    return {
      message:
        '등록된 이메일이 있으면 비밀번호 재설정 안내를 보냈습니다. 메일함을 확인해 주세요.',
    };
  }

  async resetPassword(token: string, password: string) {
    const t = String(token ?? '').trim();
    const pwd = String(password ?? '');
    if (!t) throw new BadRequestException('재설정 토큰이 없습니다.');
    if (pwd.length < 4) {
      throw new BadRequestException('비밀번호는 4자 이상이어야 합니다.');
    }

    const user = await this.userRepo.findOne({
      where: { passwordResetToken: t },
    });
    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        '유효하지 않거나 만료된 링크입니다. 다시 요청해 주세요.',
      );
    }

    if (user.role === 'teacher' && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pwd)) {
      throw new BadRequestException(
        '강사 비밀번호는 8자 이상, 영문·숫자를 각각 1자 이상 포함해야 합니다.',
      );
    }

    user.passwordHash = await bcrypt.hash(pwd, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepo.save(user);

    return { message: '비밀번호가 변경되었습니다. 로그인해 주세요.' };
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
      profile_html: u.profileHtml ?? null,
      banner_url: u.bannerUrl ?? null,
      settlement_bank: u.settlementBankName ?? null,
      settlement_account_no: u.settlementAccountNo ?? null,
      settlement_holder: u.settlementHolderName ?? null,
    };
  }
}
