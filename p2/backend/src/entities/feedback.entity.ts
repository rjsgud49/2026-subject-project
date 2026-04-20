import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type FeedbackStatus = 'pending' | 'in_progress' | 'answered';

@Entity('p2_feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'teacher_id', type: 'bigint', nullable: true })
  teacherId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User | null;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'student_question', type: 'text' })
  studentQuestion: string;

  /** 학생 첨부: [{ "url": "/api/v1/files/...", "filename": "원본명" }] */
  @Column({ name: 'student_attachments_json', type: 'text', nullable: true })
  studentAttachmentsJson: string | null;

  @Column({ name: 'teacher_question', type: 'text', nullable: true })
  teacherQuestion: string | null;

  @Column({ name: 'teacher_feedback', type: 'text', nullable: true })
  teacherFeedback: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: FeedbackStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
