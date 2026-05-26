import {
  Column,
  CreateDateColumn,
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
  @Column()
  userId: number;

  @Column({ type: 'int', default: 0 })
  doc: number;

  @Column({ type: 'int', default: 0 })
  video: number;

  @Column({ type: 'int', default: 0 })
  premium: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
