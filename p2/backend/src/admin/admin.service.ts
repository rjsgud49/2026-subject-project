import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { Enrollment } from '../entities/enrollment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
  ) {}

  async stats() {
    const [users, courses, enrollments] = await Promise.all([
      this.userRepo.count(),
      this.courseRepo.count(),
      this.enrollRepo.count(),
    ]);
    const byRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany<{ role: string; count: string }>();
    const roleCounts = { admin: 0, teacher: 0, student: 0 };
    for (const r of byRole) {
      if (r.role in roleCounts)
        (roleCounts as Record<string, number>)[r.role] = parseInt(r.count, 10);
    }
    return { users, courses, enrollments, byRole: roleCounts };
  }

  async listUsers() {
    const rows = await this.userRepo.find({
      order: { id: 'ASC' },
      select: ['id', 'email', 'name', 'role', 'createdAt'],
    });
    return rows;
  }

  async updateUserRole(userId: number, role: UserRole) {
    const u = await this.userRepo.findOne({ where: { id: userId } });
    if (!u) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    u.role = role;
    await this.userRepo.save(u);
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }

  async listAllCourses() {
    const rows = await this.courseRepo.find({
      relations: ['instructor'],
      order: { id: 'DESC' },
    });
    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      price: c.price,
      is_published: c.isPublished,
      instructor_id: c.instructorId,
      instructor: c.instructor
        ? {
            id: c.instructor.id,
            name: c.instructor.name,
            email: c.instructor.email,
          }
        : null,
      created_at: c.createdAt,
    }));
  }
}
