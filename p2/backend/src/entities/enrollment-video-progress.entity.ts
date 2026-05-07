import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';

@Entity('p2_enrollment_video_progress')
@Unique(['enrollmentId', 'videoId'])
export class EnrollmentVideoProgress {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'enrollment_id', type: 'bigint' })
  enrollmentId: number;

  @ManyToOne(() => Enrollment, (e) => e.videoProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  /** 커리큘럼 JSON 내 영상 `id` */
  @Column({ name: 'video_id', type: 'bigint' })
  videoId: number;

  @Column({ name: 'last_second', type: 'int', default: 0 })
  lastSecond: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
