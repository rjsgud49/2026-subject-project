import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

function cleanOneLine(s: string): string {
  return String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function toPublicRow(r: Review) {
  return {
    id: r.id,
    display_name: r.displayName,
    tagline: r.tagline,
    rating: r.rating,
    text: r.text,
    created_at: r.createdAt.toISOString(),
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async listPublic(limit = 12) {
    const rows = await this.reviewRepo.find({
      where: { isApproved: true },
      order: { createdAt: 'DESC' },
      take: Math.max(1, Math.min(24, Number(limit) || 12)),
    });
    return rows.map(toPublicRow);
  }

  async listPending() {
    const rows = await this.reviewRepo.find({
      where: { isApproved: false },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return rows.map((r) => ({
      ...toPublicRow(r),
      is_approved: r.isApproved,
    }));
  }

  async create(userId: number | null, dto: CreateReviewDto) {
    const row = this.reviewRepo.create({
      userId,
      displayName: cleanOneLine(dto.display_name).slice(0, 30) || '익명',
      tagline: dto.tagline ? cleanOneLine(dto.tagline).slice(0, 40) : null,
      rating: Number(dto.rating),
      text: cleanOneLine(dto.text).slice(0, 240),
      isApproved: false,
    });
    await this.reviewRepo.save(row);
    return {
      ...toPublicRow(row),
      pending: true,
      message: '리뷰가 접수되었습니다. 검수 후 랜딩 페이지에 노출됩니다.',
    };
  }

  async approve(id: number) {
    const row = await this.reviewRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    row.isApproved = true;
    await this.reviewRepo.save(row);
    return { ok: true, id: row.id };
  }

  async reject(id: number) {
    const row = await this.reviewRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    await this.reviewRepo.remove(row);
    return { ok: true, id };
  }
}
