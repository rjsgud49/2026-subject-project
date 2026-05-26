import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Express } from 'express';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { User } from '../entities/user.entity';
import { TeacherRevenueLine } from '../entities/teacher-revenue-line.entity';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  PLATFORM_FEE_RATE,
  splitEnrollmentRevenue,
} from '../settlement.constants';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(TeacherRevenueLine)
    private readonly revenueRepo: Repository<TeacherRevenueLine>,
  ) {}

  /** 수강 행은 있는데 매출 원장이 없으면 집계·최근 구매 목록이 0으로 보이므로 보정한다. */
  private async backfillMissingRevenueLines(
    instructorId: number,
    courseIds: number[],
  ) {
    if (!courseIds.length) return;
    const enrollments = await this.enrollRepo.find({
      where: { courseId: In(courseIds) },
      relations: ['course'],
    });
    for (const en of enrollments) {
      if (!en.course) continue;
      if (Number(en.course.instructorId) !== Number(instructorId)) continue;
      const dup = await this.revenueRepo.findOne({
        where: { enrollmentId: en.id },
      });
      if (dup) continue;
      const { gross, platformFee, net } = splitEnrollmentRevenue(
        en.course.price,
      );
      await this.revenueRepo.save(
        this.revenueRepo.create({
          teacherId: en.course.instructorId,
          courseId: en.courseId,
          enrollmentId: en.id,
          priceSnapshot: en.course.price,
          grossAmount: gross,
          platformFee,
          netAmount: net,
          enrolledAt: en.enrolledAt,
        }),
      );
    }
  }

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
    const courseIds = courses.map((c) => Number(c.id));
    await this.backfillMissingRevenueLines(instructorId, courseIds);
    const lines = await this.revenueRepo.find({
      where: { teacherId: instructorId },
    });
    const aggByCourse = new Map<
      number,
      { n: number; gross: number; fee: number; net: number }
    >();
    let grossAll = 0;
    let feeAll = 0;
    let enrollAll = 0;
    for (const L of lines) {
      const cid = Number(L.courseId);
      const a = aggByCourse.get(cid) ?? { n: 0, gross: 0, fee: 0, net: 0 };
      a.n += 1;
      a.gross += L.grossAmount;
      a.fee += L.platformFee;
      a.net += L.netAmount;
      aggByCourse.set(cid, a);
      grossAll += L.grossAmount;
      feeAll += L.platformFee;
      enrollAll += 1;
    }
    let viewAll = 0;
    const courseRows = courses.map((c) => {
      const cid = Number(c.id);
      const a = aggByCourse.get(cid) ?? { n: 0, gross: 0, fee: 0, net: 0 };
      const vc = c.viewCount ?? 0;
      viewAll += vc;
      return {
        id: c.id,
        title: c.title,
        is_published: c.isPublished,
        price: c.price,
        view_count: vc,
        enrollment_count: a.n,
        gross_revenue: a.gross,
        platform_fee: a.fee,
        net_revenue: a.net,
      };
    });
    return {
      platform_fee_rate: PLATFORM_FEE_RATE,
      revenue_source: 'ledger' as const,
      totals: {
        gross_revenue: grossAll,
        platform_fee: feeAll,
        net_revenue: grossAll - feeAll,
        total_enrollments: enrollAll,
        total_views: viewAll,
      },
      courses: courseRows,
    };
  }

  async getRevenueLedger(
    teacherId: number,
    page = 1,
    size = 20,
  ): Promise<{
    page: number;
    size: number;
    total: number;
    items: {
      id: number;
      course_id: number;
      course_title: string | null;
      enrollment_id: number;
      price_snapshot: number;
      gross_amount: number;
      platform_fee: number;
      net_amount: number;
      enrolled_at: Date;
    }[];
  }> {
    const myCourseIds = (
      await this.courseRepo.find({
        where: { instructorId: teacherId },
        select: ['id'],
      })
    ).map((c) => Number(c.id));
    await this.backfillMissingRevenueLines(teacherId, myCourseIds);
    const p = Math.max(1, page);
    const s = Math.min(100, Math.max(1, size));
    const [rows, total] = await this.revenueRepo.findAndCount({
      where: { teacherId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
      skip: (p - 1) * s,
      take: s,
    });
    return {
      page: p,
      size: s,
      total,
      items: rows.map((r) => ({
        id: Number(r.id),
        course_id: Number(r.courseId),
        course_title: r.course?.title ?? null,
        enrollment_id: Number(r.enrollmentId),
        price_snapshot: r.priceSnapshot,
        gross_amount: r.grossAmount,
        platform_fee: r.platformFee,
        net_amount: r.netAmount,
        enrolled_at: r.enrolledAt,
      })),
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
      u.settlementAccountNo = dto.settlement_account_no
        ?.replace(/\s/g, '')
        .trim() || null;
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
