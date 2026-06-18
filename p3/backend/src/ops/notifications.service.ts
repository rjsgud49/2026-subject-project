import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSubscription } from '../entities/notification-subscription.entity';
import type { OpsEventType } from './ops.constants';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationSubscription)
    private readonly subRepo: Repository<NotificationSubscription>,
  ) {}

  private parseEvents(json: string): string[] {
    try {
      const arr = JSON.parse(json) as unknown;
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  }

  async listMine(userId: number) {
    const rows = await this.subRepo.find({
      where: { userId },
      order: { id: 'DESC' },
    });
    return rows.map((r) => ({
      id: Number(r.id),
      channel: r.channel,
      target: r.target,
      event_types: this.parseEvents(r.eventTypesJson),
      enabled: r.enabled,
      updated_at: r.updatedAt,
    }));
  }

  async upsertMine(
    userId: number,
    body: {
      channel: 'email' | 'discord';
      target: string;
      event_types: string[];
      enabled?: boolean;
    },
  ) {
    const target = body.target.trim();
    if (!target) throw new BadRequestException('알림 대상을 입력하세요.');
    if (body.channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      throw new BadRequestException('올바른 이메일 형식이 아닙니다.');
    }
    if (
      body.channel === 'discord' &&
      !target.startsWith('https://discord.com/api/webhooks/')
    ) {
      throw new BadRequestException('Discord Webhook URL 형식이 아닙니다.');
    }

    let row = await this.subRepo.findOne({
      where: { userId, channel: body.channel, target },
    });
    if (!row) {
      row = this.subRepo.create({ userId, channel: body.channel, target });
    }
    row.eventTypesJson = JSON.stringify(body.event_types ?? []);
    row.enabled = body.enabled !== false;
    await this.subRepo.save(row);
    return {
      id: Number(row.id),
      channel: row.channel,
      target: row.target,
      event_types: this.parseEvents(row.eventTypesJson),
      enabled: row.enabled,
    };
  }

  async removeMine(userId: number, id: number) {
    const row = await this.subRepo.findOne({ where: { id, userId } });
    if (!row) return { ok: true };
    await this.subRepo.remove(row);
    return { ok: true };
  }

  async dispatch(event: OpsEventType, payload: Record<string, unknown>, userIds: number[]) {
    if (!userIds.length) return;
    let active: NotificationSubscription[] = [];
    try {
      active = await this.subRepo
        .createQueryBuilder('s')
        .where('s.enabled = :on', { on: true })
        .andWhere('s.user_id IN (:...ids)', { ids: userIds })
        .getMany();
    } catch (e) {
      this.logger.warn(
        `알림 구독 조회 실패: ${e instanceof Error ? e.message : e}`,
      );
      return;
    }

    const title = `[P3 LMS] ${event}`;
    const text = JSON.stringify(payload, null, 2);

    for (const sub of active) {
      const types = this.parseEvents(sub.eventTypesJson);
      if (types.length && !types.includes(event)) continue;
      try {
        if (sub.channel === 'email') {
          await this.sendEmail(sub.target, title, text);
        } else if (sub.channel === 'discord') {
          await this.sendDiscord(sub.target, title, text);
        }
      } catch (e) {
        this.logger.warn(
          `알림 실패 ${sub.channel} user=${sub.userId}: ${e instanceof Error ? e.message : e}`,
        );
      }
    }
  }

  private smtpPass(): string {
    const raw = process.env.SMTP_PASS ?? '';
    return raw.replace(/^["']|["']$/g, '');
  }

  private async sendEmail(to: string, subject: string, body: string) {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.logger.log(`[email→${to}] ${subject}\n${body.slice(0, 200)}`);
      return;
    }
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    const secure = process.env.SMTP_SECURE === 'true';
    const requireTLS =
      process.env.SMTP_REQUIRE_TLS === 'true' || (!secure && port === 587);
    const nodemailer = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: this.smtpPass() }
        : undefined,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@p3-lms.local',
      to,
      subject,
      text: body,
    });
  }

  private async sendDiscord(webhookUrl: string, title: string, description: string) {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ title, description: description.slice(0, 4000), color: 0x2563eb }],
      }),
    });
    if (!res.ok) {
      throw new Error(`Discord ${res.status}`);
    }
  }
}
