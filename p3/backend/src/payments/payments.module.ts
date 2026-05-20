import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrder } from '../entities/payment-order.entity';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { NicepayService } from './nicepay.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrder, Course, Enrollment]),
    EnrollmentsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, NicepayService, RolesGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
