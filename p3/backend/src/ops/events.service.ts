import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WebhooksService } from './webhooks.service';
import type { OpsEventType } from './ops.constants';

@Injectable()
export class EventsService {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhooksService,
  ) {}

  async emit(
    event: OpsEventType,
    payload: Record<string, unknown>,
    userIds: number[] = [],
  ) {
    await Promise.all([
      this.notifications.dispatch(event, payload, userIds),
      this.webhooks.dispatch(event, payload),
    ]);
  }
}
