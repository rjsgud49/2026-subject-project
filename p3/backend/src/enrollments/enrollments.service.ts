import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { Course } from '../entities/course.entity';
import { EnrollmentVideoProgress } from '../entities/enrollment-video-progress.entity';
import { TeacherRevenueLine } from '../entities/teacher-revenue-line.entity';
import { CartService } from '../cart/cart.service';
import { UpdateVideoProgressDto } from './dto/update-video-progress.dto';
import { splitEnrollmentRevenue } from '../settlement.constants';

type CurriculumVideo = { id: number; duration: number };

function flattenCurriculumVideos(curriculumJson: string | null): CurriculumVideo[] {
  if (!curriculumJson) return [];
  try {
    const o = JSON.parse(curriculumJson) as {
      sections?: {
        videos?: {
          id?: number;
          duration_seconds?: number;
          duration?: number;
        }[];
      }[];
    };
    const out: CurriculumVideo[] = [];
    for (const s of o.sections ?? []) {
      for (const v of s.videos ?? []) {
        const id = Number(v?.id);
        if (!Number.isFinite(id)) continue;
        const duration = Math.max(
          1,
          Number(v?.duration_seconds ?? v?.duration ?? 0) || 1,
        );
        out.push({ id, duration });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function computeProgressPercent(
  videos: CurriculumVideo[],
  progressRows: EnrollmentVideoProgress[],
): number {
  if (!videos.length) return 0;
  const pmap = new Map<number, EnrollmentVideoProgress>();
  for (const p of progressRows) pmap.set(Number(p.videoId), p);
  let sum = 0;
  for (const v of videos) {
    const p = pmap.get(v.id);
    if (!p) continue;
    if (p.completed) sum += 100;
    else if (p.lastSecond > 0)
      sum += Math.min(100, (p.lastSecond / v.duration) * 100);
  }
  return Math.min(100, Math.round(sum / videos.length));
}

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(EnrollmentVideoProgress)
    private readonly progressRepo: Repository<EnrollmentVideoProgress>,
    @InjectRepository(TeacherRevenueLine)
    private readonly revenueRepo: Repository<TeacherRevenueLine>,
    private readonly cartService: CartService,
  ) {}

  private async createRevenueLineForEnrollment(
    enrollment: Enrollment,
    course: Course,
  ) {
    const dup = await this.revenueRepo.findOne({
      where: { enrollmentId: enrollment.id },
    });
    if (dup) return;
    const { gross, platformFee, net } = splitEnrollmentRevenue(course.price);
    const line = this.revenueRepo.create({
      teacherId: course.instructorId,
      courseId: course.id,
      enrollmentId: enrollment.id,
      priceSnapshot: course.price,
      grossAmount: gross,
      platformFee,
      netAmount: net,
      enrolledAt: enrollment.enrolledAt,
    });
    await this.revenueRepo.save(line);
  }

  async enroll(userId: number, courseId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (!course.isPublished)
      throw new ForbiddenException(
        '공개되지 않은 강의에는 수강신청할 수 없습니다.',
      );

    const dup = await this.enrollRepo.findOne({ where: { userId, courseId } });
    if (dup) throw new ConflictException('이미 수강 중인 강의입니다.');

    const saved = await this.enrollRepo.save(
      this.enrollRepo.create({ userId, courseId }),
    );
    await this.createRevenueLineForEnrollment(saved, course);
    await this.cartService.removeIfExists(userId, courseId);
    return this.toDto(saved, course, []);
  }

  async listMine(userId: number) {
    const rows = await this.enrollRepo.find({
      where: { userId },
      relations: ['course', 'course.instructor'],
      order: { enrolledAt: 'DESC' },
    });
    if (!rows.length) return [];
    const enrolIds = rows.map((r) => Number(r.id));
    const progressAll = await this.progressRepo.find({
      where: { enrollmentId: In(enrolIds) },
    });
    const byEnr = new Map<number, EnrollmentVideoProgress[]>();
    for (const p of progressAll) {
      const k = Number(p.enrollmentId);
      if (!byEnr.has(k)) byEnr.set(k, []);
      byEnr.get(k)!.push(p);
    }
    return rows.map((e) =>
      this.toDto(e, e.course, byEnr.get(Number(e.id)) ?? []),
    );
  }

  async removeMine(userId: number, enrollmentId: number) {
    const e = await this.enrollRepo.findOne({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');
    if (e.userId !== userId)
      throw new ForbiddenException('본인 수강만 취소할 수 있습니다.');
    await this.enrollRepo.remove(e);
    return { ok: true };
  }

  async getProgress(userId: number, enrollmentId: number) {
    const e = await this.enrollRepo.findOne({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');
    if (Number(e.userId) !== Number(userId))
      throw new ForbiddenException('본인 수강만 조회할 수 있습니다.');
    const rows = await this.progressRepo.find({
      where: { enrollmentId: e.id },
    });
    return rows.map((r) => ({
      video_id: Number(r.videoId),
      last_second: r.lastSecond,
      completed: r.completed,
    }));
  }

  async upsertProgress(
    userId: number,
    enrollmentId: number,
    videoId: number,
    dto: UpdateVideoProgressDto,
  ) {
    const e = await this.enrollRepo.findOne({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');
    if (Number(e.userId) !== Number(userId))
      throw new ForbiddenException('본인 수강만 기록할 수 있습니다.');

    let row = await this.progressRepo.findOne({
      where: { enrollmentId: e.id, videoId },
    });
    if (!row) {
      row = this.progressRepo.create({
        enrollmentId: e.id,
        videoId,
        lastSecond: dto.last_second,
        completed: dto.completed,
      });
    } else {
      row.lastSecond = Math.max(row.lastSecond, dto.last_second);
      row.completed = row.completed || dto.completed;
    }
    await this.progressRepo.save(row);
    e.lastVideoId = videoId;
    await this.enrollRepo.save(e);
    return { ok: true };
  }

  private toDto(
    e: Enrollment,
    course: Course | null,
    progressRows: EnrollmentVideoProgress[],
  ) {
    const flat = course ? flattenCurriculumVideos(course.curriculumJson) : [];
    const progressPercent = computeProgressPercent(flat, progressRows);
    const status = progressPercent >= 100 ? 'completed' : 'active';

    return {
      id: Number(e.id),
      course_id: Number(e.courseId),
      enrolled_at: e.enrolledAt,
      last_video_id: e.lastVideoId != null ? Number(e.lastVideoId) : null,
      progress_percent: progressPercent,
      status,
      course_title: course?.title ?? null,
      thumbnail_url: course?.thumbnailUrl ?? null,
      course: course
        ? {
            id: Number(course.id),
            title: course.title,
            price: course.price,
            instructor: course.instructor
              ? {
                  id: Number(course.instructor.id),
                  name: course.instructor.name,
                }
              : null,
          }
        : null,
    };
  }
}
