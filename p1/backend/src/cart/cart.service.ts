import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Enrollment } from '../entities/enrollment.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  async findAll(userId: number) {
    const items = await this.cartRepo.find({
      where: { userId },
      relations: { course: true },
      order: { addedAt: 'DESC' },
    });
    return items.map((i) => ({
      id: i.id,
      course_id: i.courseId,
      course_title: i.course?.title ?? '',
      price: Number(i.course?.price ?? 0),
      added_at: i.addedAt,
    }));
  }

  async add(userId: number, courseId: number) {
    const existing = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (existing) throw new ConflictException('이미 수강 중인 강의입니다.');

    const inCart = await this.cartRepo.findOne({
      where: { userId, courseId },
    });
    if (inCart) throw new ConflictException('이미 장바구니에 있습니다.');

    const item = this.cartRepo.create({ userId, courseId });
    await this.cartRepo.save(item);
    return { success: true };
  }

  async remove(userId: number, courseId: number) {
    await this.cartRepo.delete({ userId, courseId });
  }
}
