import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';

export type CartItemRow = {
  id: number;
  course_id: number;
  course_title: string;
  price: number;
};

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
  ) {}

  async list(userId: number): Promise<CartItemRow[]> {
    const rows = await this.cartRepo.find({
      where: { userId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => ({
      id: Number(r.id),
      course_id: Number(r.courseId),
      course_title: r.course?.title ?? '',
      price: r.course?.price ?? 0,
    }));
  }

  async add(userId: number, courseId: number): Promise<CartItemRow> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    if (!course.isPublished) {
      throw new ForbiddenException('공개된 강의만 장바구니에 담을 수 있습니다.');
    }

    const enrolled = await this.enrollRepo.findOne({
      where: { userId, courseId },
    });
    if (enrolled) {
      throw new ConflictException('이미 수강 중인 강의입니다.');
    }

    const dup = await this.cartRepo.findOne({ where: { userId, courseId } });
    if (dup) throw new ConflictException('이미 장바구니에 있습니다.');

    const row = this.cartRepo.create({ userId, courseId });
    await this.cartRepo.save(row);
    const withCourse = await this.cartRepo.findOne({
      where: { id: row.id },
      relations: ['course'],
    });
    if (!withCourse) throw new NotFoundException();
    return {
      id: Number(withCourse.id),
      course_id: Number(withCourse.courseId),
      course_title: withCourse.course?.title ?? '',
      price: withCourse.course?.price ?? 0,
    };
  }

  async remove(userId: number, courseId: number): Promise<void> {
    await this.cartRepo.delete({ userId, courseId });
  }

  /** 수강신청 완료 후 장바구니에서 제거 (없으면 무시) */
  async removeIfExists(userId: number, courseId: number): Promise<void> {
    await this.cartRepo.delete({ userId, courseId });
  }
}
