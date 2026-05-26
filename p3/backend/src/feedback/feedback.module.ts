import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from '../entities/feedback.entity';
import { FeedbackTicketWallet } from '../entities/feedback-ticket-wallet.entity';
import { PaymentOrder } from '../entities/payment-order.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackTicketsService } from './feedback-tickets.service';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback, FeedbackTicketWallet, PaymentOrder]),
    OpsModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackTicketsService, RolesGuard],
  exports: [FeedbackTicketsService],
})
export class FeedbackModule {}
