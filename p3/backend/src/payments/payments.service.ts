import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaymentOrder } from '../entities/payment-order.entity';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { PaymentGatewayService, PaymentAuthReturnBody } from './payment-gateway.service';
import { EventsService } from '../ops/events.service';
import { FeedbackTicketsService } from '../feedback/feedback-tickets.service';
import {
  FEEDBACK_PLANS,
  FeedbackPlanId,
  TICKETS_PER_PURCHASE,
  isFeedbackPlanId,
} from '../feedback/feedback.constants';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    private readonly paymentGateway: PaymentGatewayService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly events: EventsService,
    private readonly feedbackTickets: FeedbackTicketsService,
  ) {}

  private redirectFeedbackOk(orderId: string, plan: string, tid?: string | null) {
    const q = new URLSearchParams({
      status: 'ok',
      type: 'feedback',
      orderId,
      plan,
    });
    if (tid) q.set('tid', tid);
    return this.redirect(`/checkout/complete?${q.toString()}`);
  }

  private redirectFeedbackFail(orderId: string | undefined, msg: string) {
    const q = new URLSearchParams({
      status: 'fail',
      type: 'feedback',
      msg,
    });
    if (orderId) q.set('orderId', orderId);
    return this.redirect(`/checkout/complete?${q.toString()}`);
  }

  private frontendBase(): string {
    return (process.env.CORS_ORIGIN ?? 'http://localhost:5174').replace(
      /\/$/,
      '',
    );
  }

  private redirect(path: string): string {
    return `${this.frontendBase()}${path}`;
  }

  private makeOrderId(userId: number): string {
    const rand = Math.random().toString(36).slice(2, 8);
    return `P3${userId}${Date.now()}${rand}`.slice(0, 64);
  }

  private parseCourseIds(json: string): number[] {
    try {
      const arr = JSON.parse(json) as unknown;
      if (!Array.isArray(arr)) return [];
      return arr.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
    } catch {
      return [];
    }
  }

  async prepare(userId: number, courseIds: number[]) {
    const uniqueIds = [...new Set(courseIds.map((id) => Number(id)))];
    if (!uniqueIds.length) {
      throw new BadRequestException('결제할 강의를 선택해 주세요.');
    }

    const courses = await this.courseRepo.find({
      where: { id: In(uniqueIds), isPublished: true },
    });
    if (courses.length !== uniqueIds.length) {
      throw new BadRequestException(
        '일부 강의를 찾을 수 없거나 비공개 상태입니다.',
      );
    }

    const existing = await this.enrollRepo.find({
      where: { userId, courseId: In(uniqueIds) },
    });
    if (existing.length) {
      throw new ConflictException('이미 수강 중인 강의가 포함되어 있습니다.');
    }

    const amount = courses.reduce((s, c) => s + Number(c.price || 0), 0);
    const goodsName =
      courses.length === 1
        ? courses[0].title.slice(0, 40)
        : `면접인강 강의 ${courses.length}건`.slice(0, 40);

    if (amount <= 0) {
      return {
        free: true as const,
        course_ids: uniqueIds,
        amount: 0,
        goodsName,
      };
    }

    if (!this.paymentGateway.isConfigured()) {
      throw new ServiceUnavailableException(
        '결제 모듈이 설정되지 않았습니다. PAYMENT_CLIENT_ID / PAYMENT_SECRET_KEY (또는 NICEPAY_CLIENT_ID / NICEPAY_SECRET_KEY)를 확인하세요.',
      );
    }

    const orderId = this.makeOrderId(userId);
    const order = this.orderRepo.create({
      orderId,
      userId,
      orderType: 'course',
      courseIdsJson: JSON.stringify(uniqueIds),
      amount,
      goodsName,
      status: 'pending',
    });
    await this.orderRepo.save(order);

    return {
      free: false as const,
      order_type: 'course' as const,
      clientId: this.paymentGateway.getPublicClientId(),
      orderId,
      amount,
      goodsName,
      returnUrl: this.paymentGateway.buildReturnUrl(),
    };
  }

  async prepareFeedback(userId: number, planId: string) {
    if (!isFeedbackPlanId(planId)) {
      throw new BadRequestException('유효하지 않은 이용권 플랜입니다.');
    }
    const meta = FEEDBACK_PLANS[planId as FeedbackPlanId];
    const amount = meta.price;
    if (amount <= 0) {
      throw new BadRequestException('결제 금액이 올바르지 않습니다.');
    }
    if (!this.paymentGateway.isConfigured()) {
      throw new ServiceUnavailableException(
        '결제 모듈이 설정되지 않았습니다. PAYMENT_CLIENT_ID / PAYMENT_SECRET_KEY (또는 NICEPAY_CLIENT_ID / NICEPAY_SECRET_KEY)를 확인하세요.',
      );
    }

    const orderId = this.makeOrderId(userId);
    const goodsName = `${meta.name} 3회 이용권`.slice(0, 40);
    const order = this.orderRepo.create({
      orderId,
      userId,
      orderType: 'feedback',
      feedbackPlan: planId,
      courseIdsJson: '[]',
      amount,
      goodsName,
      status: 'pending',
    });
    await this.orderRepo.save(order);

    return {
      free: false as const,
      order_type: 'feedback' as const,
      plan_id: planId,
      clientId: this.paymentGateway.getPublicClientId(),
      orderId,
      amount,
      goodsName,
      returnUrl: this.paymentGateway.buildReturnUrl(),
    };
  }

  async fulfillFree(userId: number, courseIds: number[]) {
    const prep = await this.prepare(userId, courseIds);
    if (!prep.free) {
      throw new BadRequestException('유료 강의는 결제창을 이용해 주세요.');
    }
    const enrolled: number[] = [];
    for (const cid of prep.course_ids) {
      await this.enrollmentsService.enroll(userId, cid);
      enrolled.push(cid);
    }
    return { course_ids: enrolled, amount: 0 };
  }

  async handlePaymentReturn(body: PaymentAuthReturnBody): Promise<string> {
    const orderId = body.orderId;
    if (!orderId) {
      return this.redirect(
        '/checkout/complete?status=fail&msg=' +
          encodeURIComponent('주문번호가 없습니다.'),
      );
    }

    const order = await this.orderRepo.findOne({ where: { orderId } });
    if (!order) {
      return this.redirect(
        '/checkout/complete?status=fail&msg=' +
          encodeURIComponent('주문을 찾을 수 없습니다.'),
      );
    }

    if (order.status === 'paid') {
      if (order.orderType === 'feedback' && order.feedbackPlan) {
        return this.redirectFeedbackOk(orderId, order.feedbackPlan, order.niceTid);
      }
      const cids = this.parseCourseIds(order.courseIdsJson);
      return this.redirect(
        `/checkout/complete?status=ok&orderId=${encodeURIComponent(orderId)}&courseIds=${cids.join(',')}`,
      );
    }

    const isFeedback = order.orderType === 'feedback';

    if (body.authResultCode !== '0000') {
      order.status = 'failed';
      order.niceResultCode = body.authResultCode ?? null;
      order.niceResultMsg = body.authResultMsg ?? null;
      await this.orderRepo.save(order);
      if (isFeedback) {
        return this.redirectFeedbackFail(
          orderId,
          body.authResultMsg ?? '인증 실패',
        );
      }
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent(body.authResultMsg ?? '인증 실패')}`,
      );
    }

    const amount = Number(body.amount);
    if (amount !== order.amount) {
      order.status = 'failed';
      await this.orderRepo.save(order);
      if (isFeedback) {
        return this.redirectFeedbackFail(orderId, '결제 금액이 일치하지 않습니다.');
      }
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent('결제 금액이 일치하지 않습니다.')}`,
      );
    }

    if (!this.paymentGateway.verifyAuth(body)) {
      order.status = 'failed';
      await this.orderRepo.save(order);
      if (isFeedback) {
        return this.redirectFeedbackFail(orderId, '위변조 검증에 실패했습니다.');
      }
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent('위변조 검증에 실패했습니다.')}`,
      );
    }

    const tid = body.tid;
    if (!tid) {
      if (isFeedback) {
        return this.redirectFeedbackFail(orderId, '거래 ID가 없습니다.');
      }
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent('거래 ID가 없습니다.')}`,
      );
    }

    const approved = await this.paymentGateway.approve(tid, order.amount);
    if (approved.resultCode !== '0000') {
      order.status = 'failed';
      order.niceTid = tid;
      order.niceResultCode = approved.resultCode ?? null;
      order.niceResultMsg = approved.resultMsg ?? null;
      await this.orderRepo.save(order);
      if (isFeedback) {
        return this.redirectFeedbackFail(
          orderId,
          approved.resultMsg ?? '승인 실패',
        );
      }
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent(approved.resultMsg ?? '승인 실패')}`,
      );
    }

    order.status = 'paid';
    order.niceTid = approved.tid ?? tid;
    order.niceResultCode = approved.resultCode ?? '0000';
    order.niceResultMsg = approved.resultMsg ?? null;
    order.paidAt = new Date();
    await this.orderRepo.save(order);

    if (isFeedback) {
      const plan = order.feedbackPlan;
      if (!plan || !isFeedbackPlanId(plan)) {
        return this.redirectFeedbackFail(orderId, '이용권 플랜 정보가 없습니다.');
      }
      await this.feedbackTickets.credit(
        order.userId,
        plan as FeedbackPlanId,
        TICKETS_PER_PURCHASE,
      );
      await this.events.emit(
        'payment_success',
        {
          order_id: orderId,
          amount: order.amount,
          order_type: 'feedback',
          plan_id: plan,
          tickets: TICKETS_PER_PURCHASE,
        },
        [order.userId],
      );
      return this.redirectFeedbackOk(orderId, plan, order.niceTid);
    }

    const courseIds = this.parseCourseIds(order.courseIdsJson);
    const enrolled: number[] = [];
    for (const cid of courseIds) {
      try {
        await this.enrollmentsService.enroll(order.userId, cid);
        enrolled.push(cid);
      } catch (e) {
        if (
          e instanceof ConflictException ||
          (e instanceof Error && e.message.includes('이미 수강'))
        ) {
          enrolled.push(cid);
          continue;
        }
        throw e;
      }
    }

    await this.events.emit(
      'payment_success',
      {
        order_id: orderId,
        amount: order.amount,
        course_ids: enrolled,
      },
      [order.userId],
    );

    return this.redirect(
      `/checkout/complete?status=ok&orderId=${encodeURIComponent(orderId)}&courseIds=${enrolled.join(',')}&tid=${encodeURIComponent(order.niceTid ?? '')}`,
    );
  }

  async getOrder(userId: number, orderId: string) {
    const order = await this.orderRepo.findOne({ where: { orderId } });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    if (order.userId !== userId) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }
    return {
      order_id: order.orderId,
      order_type: order.orderType,
      status: order.status,
      amount: order.amount,
      goods_name: order.goodsName,
      course_ids: this.parseCourseIds(order.courseIdsJson),
      plan_id: order.feedbackPlan,
      paid_at: order.paidAt,
      transaction_id: order.niceTid,
    };
  }
}
