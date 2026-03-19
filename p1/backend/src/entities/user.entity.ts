import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CartItem } from './cart-item.entity';
import { Question } from './question.entity';
import { Answer } from './answer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100, default: 'User' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 20, default: 'student' })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Enrollment, (e) => e.user)
  enrollments: Enrollment[];

  @OneToMany(() => CartItem, (c) => c.user)
  cartItems: CartItem[];

  @OneToMany(() => Question, (q) => q.user)
  questions: Question[];

  @OneToMany(() => Answer, (a) => a.user)
  answers: Answer[];
}
