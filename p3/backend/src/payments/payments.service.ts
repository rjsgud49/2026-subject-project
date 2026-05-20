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
import { NicepayService, NiceAuthReturnBody } from './nicepay.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    private readonly nicepay: NicepayService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

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

    if (!this.nicepay.isConfigured()) {
      throw new ServiceUnavailableException(
        '결제 모듈이 설정되지 않았습니다. NICEPAY_CLIENT_ID / NICEPAY_SECRET_KEY를 확인하세요.',
      );
    }

    const orderId = this.makeOrderId(userId);
    const order = this.orderRepo.create({
      orderId,
      userId,
      courseIdsJson: JSON.stringify(uniqueIds),
      amount,
      goodsName,
      status: 'pending',
    });
    await this.orderRepo.save(order);

    return {
      free: false as const,
      clientId: this.nicepay.getPublicClientId(),
      orderId,
      amount,
      goodsName,
      returnUrl: this.nicepay.buildReturnUrl(),
      sandbox: true,
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

  async handleNiceReturn(body: NiceAuthReturnBody): Promise<string> {
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
      const cids = this.parseCourseIds(order.courseIdsJson);
      return this.redirect(
        `/checkout/complete?status=ok&orderId=${encodeURIComponent(orderId)}&courseIds=${cids.join(',')}`,
      );
    }

    if (body.authResultCode !== '0000') {
      order.status = 'failed';
      order.niceResultCode = body.authResultCode ?? null;
      order.niceResultMsg = body.authResultMsg ?? null;
      await this.orderRepo.save(order);
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent(body.authResultMsg ?? '인증 실패')}`,
      );
    }

    const amount = Number(body.amount);
    if (amount !== order.amount) {
      order.status = 'failed';
      await this.orderRepo.save(order);
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent('결제 금액이 일치하지 않습니다.')}`,
      );
    }

    if (!this.nicepay.verifyAuth(body)) {
      order.status = 'failed';
      await this.orderRepo.save(order);
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent('위변조 검증에 실패했습니다.')}`,
      );
    }

    const tid = body.tid;
    if (!tid) {
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent('거래 ID가 없습니다.')}`,
      );
    }

    const approved = await this.nicepay.approve(tid, order.amount);
    if (approved.resultCode !== '0000') {
      order.status = 'failed';
      order.niceTid = tid;
      order.niceResultCode = approved.resultCode ?? null;
      order.niceResultMsg = approved.resultMsg ?? null;
      await this.orderRepo.save(order);
      return this.redirect(
        `/checkout/complete?status=fail&orderId=${encodeURIComponent(orderId)}&msg=${encodeURIComponent(approved.resultMsg ?? '승인 실패')}`,
      );
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

    order.status = 'paid';
    order.niceTid = approved.tid ?? tid;
    order.niceResultCode = approved.resultCode ?? '0000';
    order.niceResultMsg = approved.resultMsg ?? null;
    order.paidAt = new Date();
    await this.orderRepo.save(order);

    return this.redirect(
      `/checkout/complete?status=ok&orderId=${encodeURIComponent(orderId)}&courseIds=${enrolled.join(',')}&tid=${encodeURIComponent(order.niceTid ?? '')}&sandbox=1`,
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
      status: order.status,
      amount: order.amount,
      goods_name: order.goodsName,
      course_ids: this.parseCourseIds(order.courseIdsJson),
      paid_at: order.paidAt,
      nice_tid: order.niceTid,
      sandbox: true,
    };
  }
}
