import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('p3_feedback_ticket_wallets')
export class FeedbackTicketWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'doc_tickets', type: 'int', default: 0 })
  doc: number;

  @Column({ name: 'video_tickets', type: 'int', default: 0 })
  video: number;

  @Column({ name: 'premium_tickets', type: 'int', default: 0 })
  premium: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
