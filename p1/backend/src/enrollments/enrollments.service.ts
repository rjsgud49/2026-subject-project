import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { VideoProgress } from '../entities/video-progress.entity';
import { CourseVideo } from '../entities/course-video.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(VideoProgress)
    private progressRepo: Repository<VideoProgress>,
    @InjectRepository(CourseVideo)
    private videoRepo: Repository<CourseVideo>,
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
  ) {}

  async findAll(userId: number, status?: string) {
    const qb = this.enrollmentRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.course', 'c')
      .where('e.userId = :userId', { userId });
    if (status) qb.andWhere('e.status = :status', { status });
    qb.orderBy('e.enrolledAt', 'DESC');

    const list = await qb.getMany();
    const result = await Promise.all(
      list.map(async (e) => {
        const progress = await this.getProgressPercent(e.id);
        const last = await this.progressRepo.findOne({
          where: { enrollmentId: e.id },
          order: { updatedAt: 'DESC' },
        });
        return {
          id: e.id,
          course_id: e.courseId,
          course_title: e.course?.title ?? '',
          thumbnail_url: e.course?.thumbnailUrl ?? '',
          progress_percent: progress.percent,
          status: e.status,
          last_video_id: last?.videoId ?? null,
          last_second: last?.lastSecond ?? null,
        };
      }),
    );
    return result;
  }

  async getProgressPercent(enrollmentId: number): Promise<{ percent: number }> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: { course: { sections: { videos: true } } },
    });
    if (!enrollment?.course) return { percent: 0 };
    const total = enrollment.course.sections?.reduce(
      (sum, s) => sum + (s.videos?.length ?? 0),
      0,
    ) ?? 0;
    if (total === 0) return { percent: 100 };
    const completed = await this.progressRepo.count({
      where: { enrollmentId, completed: true },
    });
    return { percent: Math.round((completed / total) * 100) };
  }

  async findOne(enrollmentId: number, userId: number) {
    const e = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, userId },
      relations: { course: { instructor: true, sections: { videos: true } } },
    });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');

    const progress = await this.getProgressPercent(e.id);
    const last = await this.progressRepo.findOne({
      where: { enrollmentId: e.id },
      order: { updatedAt: 'DESC' },
    });

    const course = e.course;
    const sections = (course?.sections ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      sort_order: s.sortOrder,
      videos: (s.videos ?? []).map((v) => ({
        id: v.id,
        title: v.title,
        video_url: v.videoUrl,
        duration_seconds: v.durationSeconds,
        sort_order: v.sortOrder,
      })),
    }));

    return {
      id: e.id,
      course: {
        id: course?.id,
        title: course?.title,
        description: course?.description,
        instructor_name: course?.instructor?.name,
        category: course?.category,
        difficulty: course?.difficulty,
        price: course ? Number(course.price) : 0,
        thumbnail_url: course?.thumbnailUrl,
        sections,
      },
      last_video_id: last?.videoId ?? null,
      last_second: last?.lastSecond ?? null,
      progress_percent: progress.percent,
    };
  }

  async enroll(userId: number, courseId: number) {
    const existing = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (existing) throw new ConflictException('이미 수강 중인 강의입니다.');

    const enrollment = this.enrollmentRepo.create({
      userId,
      courseId,
      status: 'active',
    });
    await this.enrollmentRepo.save(enrollment);
    await this.cartRepo.delete({ userId, courseId });
    return { id: enrollment.id };
  }

  async getProgress(enrollmentId: number, userId: number) {
    const e = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, userId },
    });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');

    const list = await this.progressRepo.find({
      where: { enrollmentId },
      relations: { video: true },
    });
    return list.map((p) => ({
      video_id: p.videoId,
      last_second: p.lastSecond,
      completed: p.completed,
      updated_at: p.updatedAt,
    }));
  }

  async upsertProgress(
    enrollmentId: number,
    userId: number,
    videoId: number,
    body: { last_second?: number; completed?: boolean },
  ) {
    const e = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, userId },
    });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');

    let row = await this.progressRepo.findOne({
      where: { enrollmentId, videoId },
    });
    if (!row) {
      row = this.progressRepo.create({ enrollmentId, videoId });
    }
    if (body.last_second != null) row.lastSecond = body.last_second;
    if (body.completed != null) row.completed = body.completed;
    await this.progressRepo.save(row);

    const total = await this.videoRepo
      .createQueryBuilder('v')
      .innerJoin('v.section', 's')
      .innerJoin('s.course', 'c')
      .where('c.id = :courseId', { courseId: e.courseId })
      .getCount();
    const completed = await this.progressRepo.count({
      where: { enrollmentId, completed: true },
    });
    if (total > 0 && completed >= total) {
      await this.enrollmentRepo.update(
        { id: enrollmentId },
        { status: 'completed' },
      );
    }

    return { success: true };
  }
}
