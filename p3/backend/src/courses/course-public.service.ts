import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';

export interface CourseListQuery {
  q?: string;
  instructor_name?: string;
  category?: string;
  interviewType?: string;
  difficulty?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  size?: number;
}

@Injectable()
export class CoursePublicService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async listPublished(query: CourseListQuery = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const instructorFilter = query.instructor_name?.trim() ?? '';
    const maxSize = 100;
    const size = Math.min(maxSize, Math.max(1, Number(query.size) || 12));

    const qb = this.courseRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.instructor', 'instructor')
      .where('c.isPublished = :pub', { pub: true });

    if (instructorFilter) {
      qb.andWhere('instructor.name = :instructorName', {
        instructorName: instructorFilter,
      });
    }
    if (query.q?.trim()) {
      const qv = `%${query.q.trim()}%`;
      qb.andWhere(
        '(c.title ILIKE :q OR c.description ILIKE :q OR instructor.name ILIKE :q)',
        { q: qv },
      );
    }
    if (query.category) {
      qb.andWhere('c.category = :category', { category: query.category });
    }
    if (query.interviewType) {
      qb.andWhere('c.interviewType = :interviewType', {
        interviewType: query.interviewType,
      });
    }
    if (query.difficulty) {
      qb.andWhere('c.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
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
        qb.orderBy(
          `(SELECT COUNT(*)::int FROM p2_enrollments en WHERE en.course_id = c.id)`,
          'DESC',
        ).addOrderBy('c.viewCount', 'DESC').addOrderBy('c.createdAt', 'DESC');
        break;
      default:
        qb.orderBy('c.createdAt', 'DESC');
    }

    const [items, total] = await qb
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    let instructor_meta:
      | {
          name: string;
          bio: string | null;
          profile_html: string | null;
          banner_url: string | null;
          categories: string[];
          total_courses: number;
        }
      | undefined;

    if (instructorFilter) {
      const baseInstructorQb = () =>
        this.courseRepo
          .createQueryBuilder('c')
          .innerJoin('c.instructor', 'instructor')
          .where('c.isPublished = :pub', { pub: true })
          .andWhere('instructor.name = :instructorName', {
            instructorName: instructorFilter,
          });

      const [totalCoursesForInstructor, categoryRows] = await Promise.all([
        baseInstructorQb().getCount(),
        baseInstructorQb()
          .select('c.category', 'category')
          .andWhere('c.category IS NOT NULL')
          .groupBy('c.category')
          .orderBy('c.category', 'ASC')
          .getRawMany(),
      ]);
      const categories = categoryRows
        .map((r: { category: string | null }) => r.category)
        .filter((c): c is string => Boolean(c));

      let bio: string | null = null;
      let profileHtml: string | null = null;
      let bannerUrl: string | null = null;
      let displayName = instructorFilter;
      if (items.length > 0) {
        const inst = items[0].instructor;
        displayName = inst?.name ?? instructorFilter;
        bio = inst?.bio ?? null;
        profileHtml = inst?.profileHtml ?? null;
        bannerUrl = inst?.bannerUrl ?? null;
      } else {
        const user = await this.userRepo.findOne({
          where: { name: instructorFilter, role: 'teacher' },
        });
        bio = user?.bio ?? null;
        profileHtml = user?.profileHtml ?? null;
        bannerUrl = user?.bannerUrl ?? null;
        if (user?.name) displayName = user.name;
      }

      instructor_meta = {
        name: displayName,
        bio,
        profile_html: profileHtml,
        banner_url: bannerUrl,
        categories,
        total_courses: totalCoursesForInstructor,
      };
    }

    return {
      items: items.map((c) => ({
        id: c.id,
        title: c.title,
        instructor_name: c.instructor?.name ?? '',
        category: c.category,
        interview_type: c.interviewType,
        difficulty: c.difficulty,
        price: c.price,
        thumbnail_url: c.thumbnailUrl,
        estimated_hours: this.estimateHours(c.curriculumJson),
        created_at: c.createdAt,
      })),
      total,
      page,
      size,
      instructor_meta,
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

  private estimateHours(curriculumJson: string | null): number | null {
    if (!curriculumJson) return null;
    try {
      const o = JSON.parse(curriculumJson) as {
        sections?: { videos?: { duration?: number; duration_seconds?: number }[] }[];
      };
      let totalSec = 0;
      for (const s of o.sections ?? []) {
        for (const v of s.videos ?? []) {
          totalSec += Number(v.duration_seconds ?? v.duration ?? 0) || 0;
        }
      }
      if (totalSec <= 0) return null;
      return Math.max(1, Math.round((totalSec / 3600) * 10) / 10);
    } catch {
      return null;
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
      category: c.category,
      interview_type: c.interviewType,
      difficulty: c.difficulty,
      estimated_hours: this.estimateHours(c.curriculumJson),
      created_at: c.createdAt,
    };
  }
}
