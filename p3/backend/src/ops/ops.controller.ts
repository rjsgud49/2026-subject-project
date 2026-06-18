import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { AuditService } from './audit.service';
import { MetricsService } from './metrics.service';
import { NotificationsService } from './notifications.service';
import { WebhooksService } from './webhooks.service';
import { UpsertSubscriptionDto } from './dto/upsert-subscription.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { RunSchedulerDto } from './dto/run-scheduler.dto';
import { EmitTestEventDto } from './dto/emit-test-event.dto';
import { OPS_EVENTS } from './ops.constants';
import { SchedulerService } from './scheduler.service';
import { EventsService } from './events.service';

@Controller()
export class OpsController {
  constructor(
    private readonly audit: AuditService,
    private readonly metrics: MetricsService,
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhooksService,
    private readonly scheduler: SchedulerService,
    private readonly events: EventsService,
  ) {}

  @Get('ops/events')
  listEventTypes() {
    return { events: OPS_EVENTS };
  }

  @Get('ops/capabilities')
  capabilities() {
    return {
      email_delivery: Boolean(process.env.SMTP_HOST?.trim()),
      discord: true,
    };
  }

  @Get('notifications/subscriptions')
  @UseGuards(AuthGuard('jwt'))
  listSubscriptions(@CurrentUser() user: AuthUser) {
    return this.notifications.listMine(user.id);
  }

  @Post('notifications/subscriptions')
  @UseGuards(AuthGuard('jwt'))
  upsertSubscription(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertSubscriptionDto,
  ) {
    return this.notifications.upsertMine(user.id, dto);
  }

  @Delete('notifications/subscriptions/:id')
  @UseGuards(AuthGuard('jwt'))
  removeSubscription(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notifications.removeMine(user.id, id);
  }

  @Get('admin/ops/metrics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  adminMetrics() {
    return this.metrics.snapshot();
  }

  @Get('admin/ops/audit-logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  adminAuditLogs() {
    return this.audit.listRecent(80);
  }

  @Get('admin/webhooks')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  listWebhooks() {
    return this.webhooks.listEndpoints();
  }

  @Post('admin/webhooks')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  createWebhook(@CurrentUser() user: AuthUser, @Body() dto: CreateWebhookDto) {
    return this.webhooks.createEndpoint(dto).then(async (r) => {
      await this.audit.log({
        userId: user.id,
        action: 'webhook.create',
        resource: 'webhook',
        resourceId: r.id,
        meta: { name: dto.name },
      });
      return r;
    });
  }

  @Delete('admin/webhooks/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  removeWebhook(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.webhooks.removeEndpoint(id).then(async (r) => {
      await this.audit.log({
        userId: user.id,
        action: 'webhook.delete',
        resource: 'webhook',
        resourceId: id,
      });
      return r;
    });
  }

  /** 시연·점검용 — 스케줄 작업 즉시 실행 */
  @Post('admin/ops/scheduler/run')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async runScheduler(
    @CurrentUser() user: AuthUser,
    @Body() dto: RunSchedulerDto,
  ) {
    const expired_orders = await this.scheduler.runExpireStalePaymentOrders(
      dto.force_expire_pending === true,
    );
    const reminded_teachers = await this.scheduler.runPendingFeedbackReminders();
    await this.audit.log({
      userId: user.id,
      action: 'scheduler.run',
      resource: 'ops',
      meta: { expired_orders, reminded_teachers, force: !!dto.force_expire_pending },
    });
    return { expired_orders, reminded_teachers };
  }

  /** 시연용 — Webhook·알림 구독 테스트 */
  @Post('admin/ops/test-event')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async emitTestEvent(
    @CurrentUser() user: AuthUser,
    @Body() dto: EmitTestEventDto,
  ) {
    const payload = {
      demo: true,
      event: dto.event,
      at: new Date().toISOString(),
    };
    const userIds = dto.user_ids?.length ? dto.user_ids : [user.id];
    await this.events.emit(dto.event, payload, userIds);
    await this.audit.log({
      userId: user.id,
      action: 'ops.test_event',
      resource: 'event',
      meta: { event: dto.event, user_ids: userIds },
    });
    return { ok: true, event: dto.event, user_ids: userIds };
  }
}
