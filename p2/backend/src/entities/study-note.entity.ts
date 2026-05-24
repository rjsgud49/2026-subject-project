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

@Entity('p2_study_notes')
@Unique(['enrollmentId', 'videoId'])
export class StudyNote {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'enrollment_id', type: 'bigint' })
  enrollmentId: number;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ name: 'video_id', type: 'bigint' })
  videoId: number;

  @Column({ type: 'text' })
  text: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
