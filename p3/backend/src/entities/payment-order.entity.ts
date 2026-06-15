import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentOrderStatus = 'pending' | 'paid' | 'failed';
export type PaymentOrderType = 'course' | 'feedback';

@Entity('p3_payment_orders')
export class PaymentOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'order_id', type: 'varchar', length: 64 })
  orderId: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'order_type', type: 'varchar', length: 20, default: 'course' })
  orderType: PaymentOrderType;

  /** feedback 주문 시 doc | video | premium */
  @Column({ name: 'feedback_plan', type: 'varchar', length: 20, nullable: true })
  feedbackPlan: string | null;

  /** JSON array of course ids (course 주문) */
  @Column({ name: 'course_ids_json', type: 'text', default: '[]' })
  courseIdsJson: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ name: 'goods_name', type: 'varchar', length: 120 })
  goodsName: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: PaymentOrderStatus;

  @Column({ name: 'nice_tid', type: 'varchar', length: 40, nullable: true })
  niceTid: string | null;

  @Column({ name: 'nice_result_code', type: 'varchar', length: 10, nullable: true })
  niceResultCode: string | null;

  @Column({ name: 'nice_result_msg', type: 'varchar', length: 200, nullable: true })
  niceResultMsg: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
