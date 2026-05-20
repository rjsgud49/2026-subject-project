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
import { Enrollment } from './enrollment.entity';
import { Question } from './question.entity';

@Entity('p2_courses')
export class Course {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: number;

  @ManyToOne(() => User, (u) => u.coursesTeaching, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  /** 커리큘럼 JSON: { sections: [{ title, videos: [{ id, title, duration, video_url }] }] } */
  @Column({ name: 'curriculum_json', type: 'text', nullable: true })
  curriculumJson: string | null;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Enrollment, (e) => e.course)
  enrollments: Enrollment[];

  @OneToMany(() => Question, (q) => q.course)
  questions: Question[];
}
