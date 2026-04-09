import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackSubmission } from '../entities/feedback-submission.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const PLAN_NAMES: Record<string, string> = {
  doc: '문서 피드백',
  video: '영상 피드백',
  premium: '심층 피드백',
};

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackSubmission)
    private repo: Repository<FeedbackSubmission>,
  ) {}

  async create(
    userId: number,
    dto: CreateFeedbackDto,
    files: Express.Multer.File[],
  ) {
    const submission = this.repo.create({
      userId,
      planId: dto.planId,
      planName: PLAN_NAMES[dto.planId] ?? dto.planId,
      jobCategory: dto.jobCategory,
      feedbackType: dto.feedbackType,
      note: dto.note ?? null,
      filePaths: files.map((f) => f.path),
      fileNames: files.map((f) =>
        Buffer.from(f.originalname, 'latin1').toString('utf8')
      ),
      status: 'pending',
    });
    return this.repo.save(submission);
  }

  async findAllByUser(userId: number) {
    const list = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return list.map((s) => this.toResponse(s));
  }

  async findOne(userId: number, id: number) {
    const s = await this.repo.findOne({ where: { id, userId } });
    if (!s) throw new NotFoundException('피드백 내역을 찾을 수 없습니다.');
    return this.toResponse(s);
  }

  private toResponse(s: FeedbackSubmission) {
    return {
      id: s.id,
      planId: s.planId,
      planName: s.planName,
      jobCategory: s.jobCategory,
      feedbackType: s.feedbackType,
      note: s.note,
      fileNames: s.fileNames,
      filePaths: s.filePaths,
      status: s.status,
      createdAt: s.createdAt,
    };
  }
}
