import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type NotificationChannel = 'email' | 'discord';

@Entity('p3_notification_subscriptions')
@Index(['userId', 'channel', 'target'], { unique: true })
export class NotificationSubscription {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  channel: NotificationChannel;

  /** 이메일 주소 또는 Discord Webhook URL */
  @Column({ type: 'varchar', length: 500 })
  target: string;

  /** JSON array of event keys */
  @Column({ name: 'event_types_json', type: 'text' })
  eventTypesJson: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
