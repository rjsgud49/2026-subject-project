import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { TeacherFeedbackUpdateDto } from './dto/teacher-feedback-update.dto';
import { User } from '../entities/user.entity';

export type FeedbackAttachmentDto = { url: string; filename: string };

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private parseAttachments(json: string | null): FeedbackAttachmentDto[] {
    if (!json) return [];
    try {
      const a = JSON.parse(json) as unknown;
      if (!Array.isArray(a)) return [];
      return a
        .filter(
          (x): x is FeedbackAttachmentDto =>
            typeof x === 'object' &&
            x != null &&
            typeof (x as FeedbackAttachmentDto).url === 'string' &&
            typeof (x as FeedbackAttachmentDto).filename === 'string',
        )
        .map((x) => ({
          url: x.url,
          filename: x.filename,
        }));
    } catch {
      return [];
    }
  }

  async createByStudent(studentId: number, dto: CreateFeedbackDto) {
    const row = this.feedbackRepo.create({
      studentId,
      title: dto.title,
      studentQuestion: dto.question,
      status: 'pending',
      teacherId: null,
      studentAttachmentsJson:
        dto.attachments && dto.attachments.length > 0
          ? JSON.stringify(dto.attachments)
          : null,
    });
    await this.feedbackRepo.save(row);
    return this.toDto(row);
  }

  async listMine(studentId: number) {
    const rows = await this.feedbackRepo.find({
      where: { studentId },
      relations: ['teacher'],
      order: { id: 'DESC' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async listForTeacher(teacherId: number) {
    const rows = await this.feedbackRepo.find({
      where: [{ teacherId }, { teacherId: IsNull() }],
      relations: ['student', 'teacher'],
      order: { id: 'DESC' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async updateByTeacher(
    teacherId: number,
    feedbackId: number,
    dto: TeacherFeedbackUpdateDto,
  ) {
    const row = await this.feedbackRepo.findOne({
      where: { id: feedbackId },
      relations: ['teacher'],
    });
    if (!row) throw new NotFoundException('피드백 요청을 찾을 수 없습니다.');

    if (row.teacherId && row.teacherId !== teacherId) {
      throw new ForbiddenException('다른 강사가 담당 중인 요청입니다.');
    }

    if (!row.teacherId) row.teacherId = teacherId;
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.teacherQuestion !== undefined)
      row.teacherQuestion = dto.teacherQuestion || null;
    if (dto.teacherFeedback !== undefined)
      row.teacherFeedback = dto.teacherFeedback || null;

    if (row.teacherFeedback && row.status !== 'answered') {
      row.status = 'answered';
    }

    await this.feedbackRepo.save(row);
    return this.getOneForTeacher(teacherId, feedbackId);
  }

  async getOneForTeacher(teacherId: number, feedbackId: number) {
    const row = await this.feedbackRepo.findOne({
      where: { id: feedbackId },
      relations: ['student', 'teacher'],
    });
    if (!row) throw new NotFoundException('피드백 요청을 찾을 수 없습니다.');
    if (row.teacherId && row.teacherId !== teacherId) {
      throw new ForbiddenException('다른 강사가 담당 중인 요청입니다.');
    }
    return this.toDto(row);
  }

  private toDto(row: Feedback) {
    return {
      id: row.id,
      title: row.title,
      student_question: row.studentQuestion,
      student_attachments: this.parseAttachments(row.studentAttachmentsJson),
      teacher_question: row.teacherQuestion,
      teacher_feedback: row.teacherFeedback,
      status: row.status,
      student_id: row.studentId,
      teacher_id: row.teacherId,
      student_name: (row as any).student?.name ?? null,
      teacher_name: row.teacher?.name ?? null,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    };
  }
}
