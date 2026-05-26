import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackTicketWallet } from '../entities/feedback-ticket-wallet.entity';
import { PaymentOrder } from '../entities/payment-order.entity';
import {
  FEEDBACK_PLANS,
  FeedbackPlanId,
  TICKETS_PER_PURCHASE,
  isFeedbackPlanId,
} from './feedback.constants';

@Injectable()
export class FeedbackTicketsService {
  constructor(
    @InjectRepository(FeedbackTicketWallet)
    private readonly walletRepo: Repository<FeedbackTicketWallet>,
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
  ) {}

  private async getOrCreateWallet(userId: number): Promise<FeedbackTicketWallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ userId, doc: 0, video: 0, premium: 0 });
      await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getWallet(userId: number) {
    const wallet = await this.getOrCreateWallet(userId);
    const history = await this.listPurchaseHistory(userId);
    return {
      tickets: { doc: wallet.doc, video: wallet.video, premium: wallet.premium },
      purchase_history: history,
      tickets_per_purchase: TICKETS_PER_PURCHASE,
    };
  }

  async credit(userId: number, planId: FeedbackPlanId, count = TICKETS_PER_PURCHASE) {
    if (!isFeedbackPlanId(planId)) {
      throw new BadRequestException('유효하지 않은 이용권 플랜입니다.');
    }
    const wallet = await this.getOrCreateWallet(userId);
    wallet[planId] += count;
    await this.walletRepo.save(wallet);
    return { doc: wallet.doc, video: wallet.video, premium: wallet.premium };
  }

  async consume(userId: number, planId: FeedbackPlanId): Promise<boolean> {
    if (!isFeedbackPlanId(planId)) {
      throw new BadRequestException('유효하지 않은 이용권 플랜입니다.');
    }
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet[planId] <= 0) {
      throw new BadRequestException('보유한 이용권이 없습니다.');
    }
    wallet[planId] -= 1;
    await this.walletRepo.save(wallet);
    return true;
  }

  async listPurchaseHistory(userId: number) {
    const orders = await this.orderRepo.find({
      where: { userId, orderType: 'feedback', status: 'paid' },
      order: { paidAt: 'DESC' },
      take: 50,
    });
    return orders.map((o) => {
      const planId = (o.feedbackPlan ?? 'doc') as FeedbackPlanId;
      const meta = FEEDBACK_PLANS[planId] ?? FEEDBACK_PLANS.doc;
      return {
        id: o.orderId,
        plan_id: planId,
        plan_name: meta.name,
        price: o.amount,
        count: TICKETS_PER_PURCHASE,
        purchased_at: o.paidAt?.toISOString() ?? o.createdAt.toISOString(),
        order_id: o.orderId,
      };
    });
  }

  assertPlan(planId: string): FeedbackPlanId {
    if (!isFeedbackPlanId(planId)) {
      throw new BadRequestException('유효하지 않은 이용권 플랜입니다.');
    }
    return planId;
  }

  planMeta(planId: FeedbackPlanId) {
    const meta = FEEDBACK_PLANS[planId];
    if (!meta) throw new NotFoundException('플랜을 찾을 수 없습니다.');
    return meta;
  }
}
