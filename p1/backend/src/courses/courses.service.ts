import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';

export interface CourseListQuery {
  q?: string;
  category?: string;
  difficulty?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  size?: number;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  async findAll(query: CourseListQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const size = Math.min(100, Math.max(1, Number(query.size) || 12));
    const qb = this.courseRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.instructor', 'instructor')
      .where('c.isPublished = :pub', { pub: true });

    if (query.q?.trim()) {
      qb.andWhere('(c.title ILIKE :q OR c.description ILIKE :q)', {
        q: `%${query.q.trim()}%`,
      });
    }
    if (query.category) {
      qb.andWhere('c.category = :category', { category: query.category });
    }
    if (query.difficulty) {
      qb.andWhere('c.difficulty = :difficulty', { difficulty: query.difficulty });
    }
    if (query.min_price != null) {
      qb.andWhere('c.price >= :min_price', { min_price: query.min_price });
    }
    if (query.max_price != null) {
      qb.andWhere('c.price <= :max_price', { max_price: query.max_price });
    }

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('c.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('c.price', 'DESC');
        break;
      case 'popular':
        qb.orderBy('c.createdAt', 'DESC'); // TODO: enrollment count
        break;
      default:
        qb.orderBy('c.createdAt', 'DESC');
    }

    const [items, total] = await qb
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      items: items.map((c) => ({
        id: c.id,
        title: c.title,
        instructor_name: c.instructor?.name ?? '',
        category: c.category,
        difficulty: c.difficulty,
        price: Number(c.price),
        thumbnail_url: c.thumbnailUrl,
        created_at: c.createdAt,
      })),
      total,
      page,
      size,
    };
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: { instructor: true, sections: { videos: true } },
      order: { sections: { sortOrder: 'ASC', videos: { sortOrder: 'ASC' } } },
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor_id: course.instructorId,
      instructor_name: course.instructor?.name ?? '',
      category: course.category,
      difficulty: course.difficulty,
      price: Number(course.price),
      thumbnail_url: course.thumbnailUrl,
      sections: (course.sections ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        sort_order: s.sortOrder,
        videos: (s.videos ?? []).map((v) => ({
          id: v.id,
          title: v.title,
          video_url: v.videoUrl,
          duration_seconds: v.durationSeconds,
          sort_order: v.sortOrder,
        })),
      })),
    };
  }
}
