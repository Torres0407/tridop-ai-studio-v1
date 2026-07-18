import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('referrals', { schema: 'billing' })
export class ReferralEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  referrerId: string;

  @Column('uuid')
  referredUserId: string;

  @Column({ unique: true })
  referralCode: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'rewarded', 'expired'],
    default: 'pending',
  })
  status: 'pending' | 'rewarded' | 'expired';

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rewardAmount: number;

  @CreateDateColumn()
  createdAt: Date;
}
