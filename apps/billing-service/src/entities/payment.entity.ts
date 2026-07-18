import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('payments', { schema: 'billing' })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  subscriptionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'varchar', default: 'paystack' })
  provider: 'paystack';

  @Column({ unique: true })
  providerPaymentId: string;

  @Column({ type: 'enum', enum: ['succeeded', 'failed', 'refunded'] })
  status: 'succeeded' | 'failed' | 'refunded';

  @CreateDateColumn()
  createdAt: Date;
}
