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
import { OPS_EVENTS } from './ops.constants';

@Controller()
export class OpsController {
  constructor(
    private readonly audit: AuditService,
    private readonly metrics: MetricsService,
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhooksService,
  ) {}

  @Get('ops/events')
  listEventTypes() {
    return { events: OPS_EVENTS };
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
}
