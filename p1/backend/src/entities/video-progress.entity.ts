import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CourseVideo } from './course-video.entity';

@Entity('video_progress')
@Unique(['enrollmentId', 'videoId'])
export class VideoProgress {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'enrollment_id', type: 'bigint' })
  enrollmentId: number;

  @ManyToOne(() => Enrollment, (e) => e.videoProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ name: 'video_id', type: 'bigint' })
  videoId: number;

  @ManyToOne(() => CourseVideo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video: CourseVideo;

  @Column({ name: 'last_second', type: 'int', default: 0 })
  lastSecond: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
