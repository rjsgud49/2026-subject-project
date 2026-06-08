import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrder } from '../entities/payment-order.entity';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { OpsModule } from '../ops/ops.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrder, Course, Enrollment]),
    EnrollmentsModule,
    OpsModule,
    FeedbackModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentGatewayService, RolesGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
