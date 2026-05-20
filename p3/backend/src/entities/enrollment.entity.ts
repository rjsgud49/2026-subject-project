import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { EnrollmentVideoProgress } from './enrollment-video-progress.entity';

@Entity('p2_enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, (u) => u.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: number;

  @ManyToOne(() => Course, (c) => c.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  /** 마지막으로 시청한 커리큘럼 영상 id (이어보기) */
  @Column({ name: 'last_video_id', type: 'bigint', nullable: true })
  lastVideoId: number | null;

  @OneToMany(() => EnrollmentVideoProgress, (p) => p.enrollment)
  videoProgress: EnrollmentVideoProgress[];
}
