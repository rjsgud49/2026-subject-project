import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { Answer } from '../entities/answer.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  async findByCourse(courseId: number, page = 1, size = 20) {
    const [items, total] = await this.questionRepo.findAndCount({
      where: { courseId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    const withCount = await Promise.all(
      items.map(async (q) => {
        const answerCount = await this.answerRepo.count({
          where: { questionId: q.id },
        });
        return {
          id: q.id,
          title: q.title,
          user_name: q.user?.name ?? '',
          answer_count: answerCount,
          created_at: q.createdAt,
        };
      }),
    );

    return { items: withCount, total };
  }

  async findOne(questionId: number) {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
      relations: { user: true, answers: { user: true } },
      order: { answers: { createdAt: 'ASC' } },
    });
    if (!question) throw new NotFoundException('질문을 찾을 수 없습니다.');

    return {
      question: {
        id: question.id,
        course_id: question.courseId,
        title: question.title,
        body: question.body,
        user_id: question.userId,
        user_name: question.user?.name ?? '',
        created_at: question.createdAt,
      },
      answers: (question.answers ?? []).map((a) => ({
        id: a.id,
        body: a.body,
        user_name: a.user?.name ?? '',
        created_at: a.createdAt,
      })),
    };
  }

  async create(
    courseId: number,
    userId: number,
    body: { title: string; body: string; is_private?: boolean },
  ) {
    const q = this.questionRepo.create({
      courseId,
      userId,
      title: body.title,
      body: body.body,
      isPrivate: body.is_private ?? false,
    });
    await this.questionRepo.save(q);
    return {
      id: q.id,
      course_id: q.courseId,
      title: q.title,
      body: q.body,
      user_id: q.userId,
      user_name: '',
      created_at: q.createdAt,
    };
  }

  async update(
    questionId: number,
    userId: number,
    body: { title?: string; body?: string },
  ) {
    const q = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!q) throw new NotFoundException('질문을 찾을 수 없습니다.');
    if (q.userId !== userId) throw new ForbiddenException('본인만 수정할 수 있습니다.');

    if (body.title != null) q.title = body.title;
    if (body.body != null) q.body = body.body;
    await this.questionRepo.save(q);
    return { success: true };
  }

  async remove(questionId: number, userId: number) {
    const q = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!q) throw new NotFoundException('질문을 찾을 수 없습니다.');
    if (q.userId !== userId) throw new ForbiddenException('본인만 삭제할 수 있습니다.');

    await this.questionRepo.remove(q);
  }

  async createAnswer(
    questionId: number,
    userId: number,
    body: { body: string },
  ) {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('질문을 찾을 수 없습니다.');

    const a = this.answerRepo.create({
      questionId,
      userId,
      body: body.body,
    });
    await this.answerRepo.save(a);
    return { id: a.id };
  }
}
