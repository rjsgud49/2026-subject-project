import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { NotificationSubscription } from '../entities/notification-subscription.entity';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';
import { PaymentOrder } from '../entities/payment-order.entity';
import { Feedback } from '../entities/feedback.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { OpsController } from './ops.controller';
import { AuditService } from './audit.service';
import { MetricsService } from './metrics.service';
import { NotificationsService } from './notifications.service';
import { WebhooksService } from './webhooks.service';
import { EventsService } from './events.service';
import { SchedulerService } from './scheduler.service';
import { RequestLogMiddleware } from './request-log.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      AuditLog,
      NotificationSubscription,
      WebhookEndpoint,
      PaymentOrder,
      Feedback,
    ]),
    AuthModule,
  ],
  controllers: [OpsController],
  providers: [
    AuditService,
    MetricsService,
    NotificationsService,
    WebhooksService,
    EventsService,
    SchedulerService,
    RolesGuard,
  ],
  exports: [AuditService, EventsService, MetricsService],
})
export class OpsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLogMiddleware).forRoutes('*');
  }
}
