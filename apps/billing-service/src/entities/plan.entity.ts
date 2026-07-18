import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PlanInterval = 'monthly' | 'yearly';
export type PlanTier = 'free' | 'starter' | 'pro' | 'business';

@Entity('plans', { schema: 'billing' })
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. "Pro", "Starter"

  @Column({ type: 'enum', enum: ['free', 'starter', 'pro', 'business'] })
  tier: PlanTier;

  @Column('decimal', { precision: 10, scale: 2 })
  priceMonthly: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceYearly: number;

  @Column({ nullable: true })
  stripePriceIdMonthly: string;

  @Column({ nullable: true })
  stripePriceIdYearly: string;

  @Column({ nullable: true })
  paystackPlanCodeMonthly: string;

  @Column({ nullable: true })
  paystackPlanCodeYearly: string;

  @Column('jsonb', { default: {} })
  features: Record<string, any>; // AI quotas, site limits, etc.

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
