import { Injectable } from '@nestjs/common';
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
    return rows.map((r) => ({
      id: r.id,
      display_name: r.displayName,
      tagline: r.tagline,
      rating: r.rating,
      text: r.text,
      created_at: r.createdAt.toISOString(),
    }));
  }

  async create(userId: number | null, dto: CreateReviewDto) {
    const row = this.reviewRepo.create({
      userId,
      displayName: cleanOneLine(dto.display_name).slice(0, 30) || '익명',
      tagline: dto.tagline ? cleanOneLine(dto.tagline).slice(0, 40) : null,
      rating: Number(dto.rating),
      text: cleanOneLine(dto.text).slice(0, 240),
      isApproved: true,
    });
    await this.reviewRepo.save(row);
    return {
      id: row.id,
      display_name: row.displayName,
      tagline: row.tagline,
      rating: row.rating,
      text: row.text,
      created_at: row.createdAt.toISOString(),
    };
  }
}

