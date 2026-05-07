import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { Enrollment } from './enrollment.entity';

/**
 * 수강 1건당 매출 스냅샷 (정산·감사용).
 * 수강 신청 시점 강의 가격·수수료를 고정 저장한다.
 */
@Entity('p2_teacher_revenue_lines')
@Unique(['enrollmentId'])
export class TeacherRevenueLine {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'teacher_id', type: 'bigint' })
  teacherId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'enrollment_id', type: 'bigint' })
  enrollmentId: number;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  /** 수강 신청 시점 강의 가격(원) */
  @Column({ name: 'price_snapshot', type: 'int' })
  priceSnapshot: number;

  @Column({ name: 'gross_amount', type: 'int' })
  grossAmount: number;

  @Column({ name: 'platform_fee', type: 'int' })
  platformFee: number;

  @Column({ name: 'net_amount', type: 'int' })
  netAmount: number;

  @Column({ name: 'enrolled_at', type: 'timestamptz' })
  enrolledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
