import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('p3_reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  /** 로그인 사용자면 userId, 아니면 null */
  @Index()
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  /** 화면에 보일 이름(익명도 가능) */
  @Column({ type: 'varchar', length: 30 })
  displayName: string;

  /** 예: "카카오 합격", "삼성 SDS 합격" */
  @Column({ type: 'varchar', length: 40, nullable: true })
  tagline: string | null;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar', length: 240 })
  text: string;

  /** 스팸 방지용 간단 승인 플래그 (기본: 바로 노출) */
  @Index()
  @Column({ type: 'boolean', default: true })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

