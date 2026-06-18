import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WebhooksService } from './webhooks.service';
import type { OpsEventType } from './ops.constants';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhooksService,
  ) {}

  async emit(
    event: OpsEventType,
    payload: Record<string, unknown>,
    userIds: number[] = [],
  ) {
    try {
      await Promise.all([
        this.notifications.dispatch(event, payload, userIds),
        this.webhooks.dispatch(event, payload),
      ]);
    } catch (e) {
      this.logger.warn(
        `이벤트 발송 실패(${event}): ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
