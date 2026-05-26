import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { PaymentOrder } from '../entities/payment-order.entity';
import { Feedback } from '../entities/feedback.entity';
import { EventsService } from './events.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    private readonly events: EventsService,
  ) {}

  /** 미결제 주문 24시간 경과 시 failed 처리 */
  @Cron(CronExpression.EVERY_HOUR)
  async expireStalePaymentOrders() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await this.orderRepo.find({
      where: { status: 'pending', createdAt: LessThan(cutoff) },
      take: 100,
    });
    for (const o of stale) {
      o.status = 'failed';
      o.niceResultMsg = '결제 시간 초과';
      await this.orderRepo.save(o);
    }
    if (stale.length) {
      this.logger.log(`만료 처리된 pending 주문: ${stale.length}건`);
    }
  }

  /** 매일 09:00 — 미답변 피드백이 있는 강사에게 알림 (구독 시) */
  @Cron('0 9 * * *')
  async remindPendingFeedback() {
    const pending = await this.feedbackRepo.find({
      where: { status: 'pending' },
      relations: ['teacher'],
    });
    const byTeacher = new Map<number, number>();
    for (const f of pending) {
      if (!f.teacherId) continue;
      byTeacher.set(f.teacherId, (byTeacher.get(f.teacherId) ?? 0) + 1);
    }
    for (const [teacherId, count] of byTeacher) {
      await this.events.emit(
        'pending_feedback_reminder',
        { count },
        [teacherId],
      );
    }
  }
}
