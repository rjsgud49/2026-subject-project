import { createHmac, randomBytes } from 'crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';
import type { OpsEventType } from './ops.constants';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepo: Repository<WebhookEndpoint>,
  ) {}

  private parseEvents(json: string): string[] {
    try {
      const arr = JSON.parse(json) as unknown;
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }

  async listEndpoints() {
    const rows = await this.endpointRepo.find({ order: { id: 'DESC' } });
    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      url: r.url,
      events: this.parseEvents(r.eventsJson),
      enabled: r.enabled,
      created_at: r.createdAt,
    }));
  }

  async createEndpoint(body: {
    name: string;
    url: string;
    events: string[];
    enabled?: boolean;
  }) {
    const secret = randomBytes(24).toString('hex');
    const row = this.endpointRepo.create({
      name: body.name.trim().slice(0, 120),
      url: body.url.trim(),
      secret,
      eventsJson: JSON.stringify(body.events ?? []),
      enabled: body.enabled !== false,
    });
    await this.endpointRepo.save(row);
    return {
      id: Number(row.id),
      name: row.name,
      url: row.url,
      secret,
      events: this.parseEvents(row.eventsJson),
      enabled: row.enabled,
    };
  }

  async removeEndpoint(id: number) {
    const row = await this.endpointRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Webhook을 찾을 수 없습니다.');
    await this.endpointRepo.remove(row);
    return { ok: true };
  }

  async dispatch(event: OpsEventType, payload: Record<string, unknown>) {
    const endpoints = await this.endpointRepo.find({ where: { enabled: true } });
    const body = JSON.stringify({ event, payload, at: new Date().toISOString() });
    for (const ep of endpoints) {
      const events = this.parseEvents(ep.eventsJson);
      if (events.length && !events.includes(event)) continue;
      const sig = createHmac('sha256', ep.secret).update(body).digest('hex');
      try {
        const res = await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-P3-Event': event,
            'X-P3-Signature': `sha256=${sig}`,
          },
          body,
        });
        if (!res.ok) {
          this.logger.warn(`Webhook ${ep.name} HTTP ${res.status}`);
        }
      } catch (e) {
        this.logger.warn(
          `Webhook ${ep.name} failed: ${e instanceof Error ? e.message : e}`,
        );
      }
    }
  }
}
