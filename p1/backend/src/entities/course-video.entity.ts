import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseSection } from './course-section.entity';

@Entity('course_videos')
export class CourseVideo {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'section_id', type: 'bigint' })
  sectionId: number;

  @ManyToOne(() => CourseSection, (s) => s.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'video_url', type: 'varchar', length: 500 })
  videoUrl: string;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
