import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CourseSection } from './course-section.entity';
import { Enrollment } from './enrollment.entity';
import { CartItem } from './cart-item.entity';
import { Question } from './question.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  difficulty: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CourseSection, (s) => s.course)
  sections: CourseSection[];

  @OneToMany(() => Enrollment, (e) => e.course)
  enrollments: Enrollment[];

  @OneToMany(() => CartItem, (c) => c.course)
  cartItems: CartItem[];

  @OneToMany(() => Question, (q) => q.course)
  questions: Question[];
}
