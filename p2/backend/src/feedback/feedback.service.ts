import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { AddFeedbackMessageDto } from './dto/add-feedback-message.dto';
import { TeacherFeedbackUpdateDto } from './dto/teacher-feedback-update.dto';

export type FeedbackAttachmentDto = { url: string; filename: string };

export type FeedbackThreadMessageDto = {
  role: 'student' | 'teacher';
  body: string;
  at: string;
};

const MAX_THREAD_MESSAGES = 200;

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
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

  private parseThread(json: string | null): FeedbackThreadMessageDto[] {
    if (!json) return [];
    try {
      const o = JSON.parse(json) as { messages?: unknown };
      const arr = Array.isArray(o?.messages) ? o.messages : [];
      const out: FeedbackThreadMessageDto[] = [];
      for (const x of arr) {
        if (typeof x !== 'object' || x == null) continue;
        const r = x as Record<string, unknown>;
        const role = r.role === 'teacher' || r.role === 'student' ? r.role : null;
        const body = typeof r.body === 'string' ? r.body : '';
        const at = typeof r.at === 'string' ? r.at : '';
        if (!role || !body.trim() || !at) continue;
        out.push({ role, body: body.trim(), at });
      }
      return out.slice(-MAX_THREAD_MESSAGES);
    } catch {
      return [];
    }
  }

  private appendThread(row: Feedback, role: 'student' | 'teacher', body: string) {
    const msgs = this.parseThread(row.threadJson);
    msgs.push({
      role,
      body: body.trim(),
      at: new Date().toISOString(),
    });
    const trimmed = msgs.slice(-MAX_THREAD_MESSAGES);
    row.threadJson = JSON.stringify({ messages: trimmed });
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
      threadJson: null,
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

  async getOneForStudent(studentId: number, feedbackId: number) {
    const row = await this.feedbackRepo.findOne({
      where: { id: feedbackId, studentId },
      relations: ['teacher'],
    });
    if (!row) throw new NotFoundException('피드백 요청을 찾을 수 없습니다.');
    return this.toDto(row);
  }

  async addStudentMessage(
    studentId: number,
    feedbackId: number,
    dto: AddFeedbackMessageDto,
  ) {
    const row = await this.feedbackRepo.findOne({
      where: { id: feedbackId, studentId },
      relations: ['teacher'],
    });
    if (!row) throw new NotFoundException('피드백 요청을 찾을 수 없습니다.');
    if (row.status === 'answered') {
      throw new BadRequestException('완료된 피드백에는 답장할 수 없습니다.');
    }
    this.appendThread(row, 'student', dto.body);
    if (row.status === 'pending') row.status = 'in_progress';
    await this.feedbackRepo.save(row);
    return this.toDto(row);
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

    if (row.status === 'answered') {
      throw new BadRequestException(
        '완료된 피드백은 수정하거나 다시 열 수 없습니다.',
      );
    }

    if (!row.teacherId) row.teacherId = teacherId;

    if (dto.status === 'answered') {
      if (dto.confirmComplete !== true) {
        throw new BadRequestException(
          '피드백을 완료하려면 확인(confirmComplete: true)가 필요합니다.',
        );
      }
      const nextFeedback =
        dto.teacherFeedback !== undefined
          ? dto.teacherFeedback
          : row.teacherFeedback;
      if (!nextFeedback || !String(nextFeedback).trim()) {
        throw new BadRequestException(
          '완료 처리 전에 최종 피드백 내용을 입력해 주세요.',
        );
      }
    }

    if (dto.status !== undefined) {
      row.status = dto.status;
    }
    if (dto.teacherQuestion !== undefined)
      row.teacherQuestion = dto.teacherQuestion || null;
    if (dto.teacherFeedback !== undefined)
      row.teacherFeedback = dto.teacherFeedback || null;

    await this.feedbackRepo.save(row);
    return this.getOneForTeacher(teacherId, feedbackId);
  }

  async addTeacherMessage(
    teacherId: number,
    feedbackId: number,
    dto: AddFeedbackMessageDto,
  ) {
    const row = await this.feedbackRepo.findOne({
      where: { id: feedbackId },
      relations: ['teacher', 'student'],
    });
    if (!row) throw new NotFoundException('피드백 요청을 찾을 수 없습니다.');
    if (row.teacherId && row.teacherId !== teacherId) {
      throw new ForbiddenException('다른 강사가 담당 중인 요청입니다.');
    }
    if (!row.teacherId) row.teacherId = teacherId;
    if (row.status === 'answered') {
      throw new BadRequestException('완료된 피드백에는 답장할 수 없습니다.');
    }
    this.appendThread(row, 'teacher', dto.body);
    if (row.status === 'pending') row.status = 'in_progress';
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
      thread: this.parseThread(row.threadJson),
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
