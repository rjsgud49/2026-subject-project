import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: {
    userId?: number | null;
    action: string;
    resource: string;
    resourceId?: string | number | null;
    meta?: Record<string, unknown>;
    ip?: string | null;
  }) {
    const row = this.auditRepo.create({
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource,
      resourceId:
        params.resourceId != null ? String(params.resourceId) : null,
      metaJson: params.meta ? JSON.stringify(params.meta) : null,
      ip: params.ip ?? null,
    });
    await this.auditRepo.save(row);
    return row;
  }

  async listRecent(limit = 50) {
    const rows = await this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: Math.min(200, Math.max(1, limit)),
    });
    return rows.map((r) => ({
      id: Number(r.id),
      user_id: r.userId != null ? Number(r.userId) : null,
      action: r.action,
      resource: r.resource,
      resource_id: r.resourceId,
      meta: r.metaJson ? JSON.parse(r.metaJson) : null,
      ip: r.ip,
      created_at: r.createdAt,
    }));
  }
}
