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
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(query: CourseListQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const instructorFilter = query.instructor_name?.trim() ?? '';
    const maxSize = 100;
    const size = Math.min(maxSize, Math.max(1, Number(query.size) || 12));
    const qb = this.courseRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.instructor', 'instructor')
      .where('c.isPublished = :pub', { pub: true });

    if (instructorFilter) {
      qb.andWhere('instructor.name = :instructorName', { instructorName: instructorFilter });
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
      qb.andWhere('c.interviewType = :interviewType', { interviewType: query.interviewType });
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

    let instructor_meta:
      | {
          name: string;
          bio: string | null;
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
      let displayName = instructorFilter;
      if (items.length > 0) {
        const inst = items[0].instructor;
        displayName = inst?.name ?? instructorFilter;
        bio = inst?.bio ?? null;
      } else {
        const user = await this.userRepo.findOne({
          where: { name: instructorFilter, role: 'instructor' },
        });
        bio = user?.bio ?? null;
        if (user?.name) displayName = user.name;
      }

      instructor_meta = {
        name: displayName,
        bio,
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
        price: Number(c.price),
        thumbnail_url: c.thumbnailUrl,
        created_at: c.createdAt,
      })),
      total,
      page,
      size,
      instructor_meta,
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
      instructor_bio: course.instructor?.bio ?? null,
      category: course.category,
      interview_type: course.interviewType,
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
