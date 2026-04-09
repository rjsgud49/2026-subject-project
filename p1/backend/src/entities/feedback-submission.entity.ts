import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('feedback_submissions')
export class FeedbackSubmission {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'plan_id', type: 'varchar', length: 20 })
  planId: string;

  @Column({ name: 'plan_name', type: 'varchar', length: 50 })
  planName: string;

  @Column({ name: 'job_category', type: 'varchar', length: 50 })
  jobCategory: string;

  @Column({ name: 'feedback_type', type: 'varchar', length: 50 })
  feedbackType: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'file_paths', type: 'text', array: true, default: [] })
  filePaths: string[];

  @Column({ name: 'file_names', type: 'text', array: true, default: [] })
  fileNames: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
