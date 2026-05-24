import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepo: Repository<Answer>,
  ) {}

  async stats() {
    const [users, courses, enrollments] = await Promise.all([
      this.userRepo.count(),
      this.courseRepo.count(),
      this.enrollRepo.count(),
    ]);
    const byRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany<{ role: string; count: string }>();
    const roleCounts = { admin: 0, teacher: 0, student: 0 };
    for (const r of byRole) {
      if (r.role in roleCounts)
        (roleCounts as Record<string, number>)[r.role] = parseInt(r.count, 10);
    }
    return { users, courses, enrollments, byRole: roleCounts };
  }

  async listUsers() {
    const rows = await this.userRepo.find({
      order: { id: 'ASC' },
      select: ['id', 'email', 'name', 'role', 'createdAt'],
    });
    return rows;
  }

  async updateUserRole(userId: number, role: UserRole) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    u.role = role;
    await this.userRepo.save(u);
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }

  async listAllCourses() {
    const rows = await this.courseRepo.find({
      relations: ['instructor'],
      order: { id: 'DESC' },
    });
    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      price: c.price,
      is_published: c.isPublished,
      moderation_status: c.moderationStatus,
      rejection_reason: c.rejectionReason,
      instructor_id: c.instructorId,
      instructor: c.instructor
        ? {
            id: c.instructor.id,
            name: c.instructor.name,
            email: c.instructor.email,
          }
        : null,
      thumbnail_url: c.thumbnailUrl,
      sections: this.parseSections(c.curriculumJson),
      created_at: c.createdAt,
    }));
  }

  private parseSections(curriculumJson: string | null): unknown[] {
    if (!curriculumJson) return [];
    try {
      const parsed = JSON.parse(curriculumJson) as { sections?: unknown[] };
      return Array.isArray(parsed?.sections) ? parsed.sections : [];
    } catch {
      return [];
    }
  }

  async setCoursePublished(
    courseId: number,
    isPublished: boolean,
    rejectionReason?: string | null,
  ) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (isPublished) {
      throw new BadRequestException('관리자는 강의를 공개로 전환할 수 없습니다.');
    }
    if (!isPublished) {
      if (course.isPublished) {
        const reason = rejectionReason?.trim() ?? '';
        if (!reason) {
          throw new BadRequestException('반려 사유를 입력해 주세요.');
        }
        course.rejectionReason = reason;
        course.moderationStatus = 'rejected';
      } else {
        course.rejectionReason = null;
        if (course.moderationStatus !== 'rejected') {
          course.moderationStatus = 'none';
        }
      }
    } else {
      course.rejectionReason = null;
      course.moderationStatus = 'approved';
    }
    course.isPublished = isPublished;
    await this.courseRepo.save(course);
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      is_published: course.isPublished,
      rejection_reason: course.rejectionReason,
      moderation_status: course.moderationStatus,
      instructor_id: course.instructorId,
      instructor: course.instructor
        ? {
            id: course.instructor.id,
            name: course.instructor.name,
            email: course.instructor.email,
          }
        : null,
      created_at: course.createdAt,
    };
  }

  async removeCourse(courseId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    await this.courseRepo.remove(course);
    return { ok: true };
  }

  async listAllQna() {
    const courses = await this.courseRepo.find({
      relations: ['instructor'],
      order: { id: 'DESC' },
    });
    const questions = await this.questionRepo.find({
      relations: { user: true, course: true, answers: { user: true } },
      order: { createdAt: 'DESC' },
    });

    return courses.map((course) => {
      const courseQuestions = questions.filter((question) => Number(question.courseId) === Number(course.id));
      return {
        id: Number(course.id),
        title: course.title,
        is_published: course.isPublished,
        instructor_name: course.instructor?.name ?? null,
        question_count: courseQuestions.length,
        questions: courseQuestions.map((question) => {
          const answers = [...(question.answers ?? [])].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          return {
            id: Number(question.id),
            title: question.title,
            body: question.body,
            is_private: question.isPrivate,
            user_name: question.user?.name ?? '',
            created_at: question.createdAt,
            answer_count: answers.length,
            answers: answers.map((answer) => ({
              id: Number(answer.id),
              body: answer.body,
              user_name: answer.user?.name ?? '',
              created_at: answer.createdAt,
            })),
          };
        }),
      };
    });
  }

  async removeQuestion(questionId: number) {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('질문을 찾을 수 없습니다.');
    await this.questionRepo.remove(question);
    return { ok: true };
  }

  async removeAnswer(answerId: number) {
    const answer = await this.answerRepo.findOne({ where: { id: answerId } });
    if (!answer) throw new NotFoundException('답변을 찾을 수 없습니다.');
    await this.answerRepo.remove(answer);
    return { ok: true };
  }
}
