import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { Course } from '../entities/course.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
  ) {}

  async enroll(userId: number, courseId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (!course.isPublished)
      throw new ForbiddenException(
        '공개되지 않은 강의에는 수강신청할 수 없습니다.',
      );

    const dup = await this.enrollRepo.findOne({ where: { userId, courseId } });
    if (dup) throw new ConflictException('이미 수강 중인 강의입니다.');

    const e = this.enrollRepo.create({ userId, courseId });
    await this.enrollRepo.save(e);
    return this.toDto(e, course);
  }

  async listMine(userId: number) {
    const rows = await this.enrollRepo.find({
      where: { userId },
      relations: ['course', 'course.instructor'],
      order: { enrolledAt: 'DESC' },
    });
    return rows.map((e) => this.toDto(e, e.course));
  }

  async removeMine(userId: number, enrollmentId: number) {
    const e = await this.enrollRepo.findOne({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');
    if (e.userId !== userId)
      throw new ForbiddenException('본인 수강만 취소할 수 있습니다.');
    await this.enrollRepo.remove(e);
    return { ok: true };
  }

  private toDto(e: Enrollment, course: Course) {
    return {
      id: e.id,
      course_id: e.courseId,
      enrolled_at: e.enrolledAt,
      course: course
        ? {
            id: course.id,
            title: course.title,
            price: course.price,
            instructor: course.instructor
              ? { id: course.instructor.id, name: course.instructor.name }
              : null,
          }
        : null,
    };
  }
}
