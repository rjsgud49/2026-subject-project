import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentOrderStatus = 'pending' | 'paid' | 'failed';

@Entity('p3_payment_orders')
export class PaymentOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  orderId: string;

  @Column()
  userId: number;

  /** JSON array of course ids */
  @Column({ type: 'text' })
  courseIdsJson: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 120 })
  goodsName: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: PaymentOrderStatus;

  @Column({ type: 'varchar', length: 40, nullable: true })
  niceTid: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  niceResultCode: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  niceResultMsg: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
