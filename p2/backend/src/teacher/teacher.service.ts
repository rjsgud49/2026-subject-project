import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { User } from '../entities/user.entity';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PLATFORM_FEE_RATE = 0.1;

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
  ) {}

  private parseCurriculumJson(
    json: string | null,
  ): Record<string, unknown> | null {
    if (!json) return null;
    try {
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private courseToTeacherRow(c: Course) {
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      price: c.price,
      is_published: c.isPublished,
      created_at: c.createdAt,
      curriculum: this.parseCurriculumJson(c.curriculumJson),
      thumbnail_url: c.thumbnailUrl,
      view_count: c.viewCount ?? 0,
    };
  }

  async getDashboard(instructorId: number) {
    const courses = await this.courseRepo.find({
      where: { instructorId },
      order: { id: 'DESC' },
    });
    const enrollments = await this.enrollRepo.find({
      where: { course: { instructorId } },
      relations: ['course'],
    });
    const countBy = new Map<number, number>();
    for (const e of enrollments) {
      const cid = Number(e.courseId);
      countBy.set(cid, (countBy.get(cid) ?? 0) + 1);
    }
    let grossAll = 0;
    let enrollAll = 0;
    let viewAll = 0;
    const courseRows = courses.map((c) => {
      const cid = Number(c.id);
      const n = countBy.get(cid) ?? 0;
      enrollAll += n;
      const gross = n * c.price;
      grossAll += gross;
      const fee = Math.round(gross * PLATFORM_FEE_RATE);
      const net = gross - fee;
      const vc = c.viewCount ?? 0;
      viewAll += vc;
      return {
        id: c.id,
        title: c.title,
        is_published: c.isPublished,
        price: c.price,
        view_count: vc,
        enrollment_count: n,
        gross_revenue: gross,
        platform_fee: fee,
        net_revenue: net,
      };
    });
    const totalPlatformFee = Math.round(grossAll * PLATFORM_FEE_RATE);
    return {
      platform_fee_rate: PLATFORM_FEE_RATE,
      totals: {
        gross_revenue: grossAll,
        platform_fee: totalPlatformFee,
        net_revenue: grossAll - totalPlatformFee,
        total_enrollments: enrollAll,
        total_views: viewAll,
      },
      courses: courseRows,
    };
  }

  async listMyCourses(instructorId: number) {
    const items = await this.courseRepo.find({
      where: { instructorId },
      order: { id: 'DESC' },
    });
    return items.map((c) => this.courseToTeacherRow(c));
  }

  async create(instructorId: number, dto: CreateCourseDto) {
    const c = this.courseRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      price: dto.price,
      instructorId,
      isPublished: dto.isPublished ?? false,
      curriculumJson:
        dto.curriculum != null ? JSON.stringify(dto.curriculum) : null,
      thumbnailUrl: dto.thumbnail_url ?? null,
      viewCount: 0,
    });
    await this.courseRepo.save(c);
    return this.oneForTeacher(c.id, instructorId);
  }

  async update(instructorId: number, courseId: number, dto: UpdateCourseDto) {
    const c = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!c) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (Number(c.instructorId) !== Number(instructorId)) {
      throw new ForbiddenException('본인 강의만 수정할 수 있습니다.');
    }
    if (dto.title !== undefined) c.title = dto.title;
    if (dto.description !== undefined) c.description = dto.description ?? null;
    if (dto.price !== undefined) c.price = dto.price;
    if (dto.isPublished !== undefined) c.isPublished = dto.isPublished;
    if (dto.curriculum !== undefined) {
      c.curriculumJson =
        dto.curriculum == null ? null : JSON.stringify(dto.curriculum);
    }
    if (dto.thumbnail_url !== undefined) {
      c.thumbnailUrl = dto.thumbnail_url ?? null;
    }
    await this.courseRepo.save(c);
    return this.oneForTeacher(c.id, instructorId);
  }

  async remove(instructorId: number, courseId: number) {
    const c = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!c) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (Number(c.instructorId) !== Number(instructorId)) {
      throw new ForbiddenException('본인 강의만 삭제할 수 있습니다.');
    }
    await this.courseRepo.remove(c);
    return { ok: true };
  }

  mediaUploadResponse(file: Express.Multer.File) {
    return {
      url: `/api/v1/files/${file.filename}`,
      filename: file.originalname,
      stored: file.filename,
    };
  }

  async confirmUpload(
    instructorId: number,
    courseId: number,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('파일이 없습니다.');
    const c = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!c) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (Number(c.instructorId) !== Number(instructorId)) {
      throw new ForbiddenException('본인 강의에만 업로드할 수 있습니다.');
    }
    return this.mediaUploadResponse(file);
  }

  async setProfileBanner(userId: number, file: Express.Multer.File) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    const url = `/api/v1/files/${file.filename}`;
    u.bannerUrl = url;
    await this.userRepo.save(u);
    return { url, banner_url: url };
  }

  private async oneForTeacher(courseId: number, instructorId: number) {
    const c = await this.courseRepo.findOne({
      where: { id: courseId, instructorId },
    });
    if (!c) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return this.courseToTeacherRow(c);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (dto.name !== undefined) u.name = dto.name;
    if (dto.bio !== undefined) u.bio = dto.bio ?? null;
    if (dto.profile_html !== undefined) u.profileHtml = dto.profile_html ?? null;
    if (dto.banner_url !== undefined) u.bannerUrl = dto.banner_url?.trim() || null;
    if (dto.settlement_bank !== undefined) {
      u.settlementBankName = dto.settlement_bank?.trim() || null;
    }
    if (dto.settlement_account_no !== undefined) {
      u.settlementAccountNo = dto.settlement_account_no?.replace(/\s/g, '').trim() || null;
    }
    if (dto.settlement_holder !== undefined) {
      u.settlementHolderName = dto.settlement_holder?.trim() || null;
    }
    await this.userRepo.save(u);
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      bio: u.bio,
      profile_html: u.profileHtml,
      banner_url: u.bannerUrl,
      settlement_bank: u.settlementBankName,
      settlement_account_no: u.settlementAccountNo,
      settlement_holder: u.settlementHolderName,
    };
  }
}
