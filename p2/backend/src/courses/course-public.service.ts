import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';

@Injectable()
export class CoursePublicService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
  ) {}

  async listPublished(page = 1, size = 12) {
    const p = Math.max(1, page);
    const s = Math.min(50, Math.max(1, size));
    const [items, total] = await this.courseRepo.findAndCount({
      where: { isPublished: true },
      relations: ['instructor'],
      order: { createdAt: 'DESC' },
      skip: (p - 1) * s,
      take: s,
    });
    return {
      items: items.map((c) => this.toPublic(c, c.viewCount ?? 0)),
      total,
      page: p,
      size: s,
    };
  }

  async getPublished(id: number) {
    const c = await this.courseRepo.findOne({
      where: { id, isPublished: true },
      relations: ['instructor'],
    });
    if (!c) throw new NotFoundException('강의를 찾을 수 없습니다.');
    await this.courseRepo.increment({ id: c.id }, 'viewCount', 1);
    const views = (c.viewCount ?? 0) + 1;
    return this.toPublic(c, views);
  }

  private parseSections(curriculumJson: string | null): unknown[] {
    if (!curriculumJson) return [];
    try {
      const o = JSON.parse(curriculumJson) as { sections?: unknown[] };
      return Array.isArray(o?.sections) ? o.sections : [];
    } catch {
      return [];
    }
  }

  private toPublic(c: Course, viewCount?: number) {
    const views = viewCount ?? c.viewCount ?? 0;
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      price: c.price,
      is_published: c.isPublished,
      view_count: views,
      instructor: c.instructor
        ? {
            id: c.instructor.id,
            name: c.instructor.name,
            email: c.instructor.email,
          }
        : null,
      instructor_name: c.instructor?.name ?? null,
      instructor_bio: c.instructor?.bio ?? null,
      instructor_profile_html: c.instructor?.profileHtml ?? null,
      instructor_banner_url: c.instructor?.bannerUrl ?? null,
      thumbnail_url: c.thumbnailUrl,
      sections: this.parseSections(c.curriculumJson),
      category: null,
      difficulty: null,
      estimated_hours: null,
      created_at: c.createdAt,
    };
  }
}
