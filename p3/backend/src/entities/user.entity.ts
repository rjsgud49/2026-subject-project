import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { Enrollment } from './enrollment.entity';
import { Question } from './question.entity';
import { Answer } from './answer.entity';

export type UserRole = 'admin' | 'teacher' | 'student';

@Entity('p2_users')
export class User {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  /** 강사 공개 프로필 (WYSIWYG HTML) */
  @Column({ name: 'profile_html', type: 'text', nullable: true })
  profileHtml: string | null;

  /** 강사 프로필 상단 배너 이미지 URL (로컬 업로드 경로 등) */
  @Column({ name: 'banner_url', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string | null;

  /** 정산용 (강사) — 공개 프로필 API에는 포함하지 않음 */
  @Column({ name: 'settlement_bank_name', type: 'varchar', length: 60, nullable: true })
  settlementBankName: string | null;

  @Column({ name: 'settlement_account_no', type: 'varchar', length: 40, nullable: true })
  settlementAccountNo: string | null;

  @Column({ name: 'settlement_holder_name', type: 'varchar', length: 100, nullable: true })
  settlementHolderName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 20, default: 'student' })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Course, (c) => c.instructor)
  coursesTeaching: Course[];

  @OneToMany(() => Enrollment, (e) => e.user)
  enrollments: Enrollment[];

  @OneToMany(() => Question, (q) => q.user)
  questions: Question[];

  @OneToMany(() => Answer, (a) => a.user)
  answers: Answer[];
}
