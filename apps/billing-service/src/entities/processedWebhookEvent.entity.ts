import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('processed_webhook_events', { schema: 'billing' })
export class ProcessedWebhookEventEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  provider: string; // 'paystack'

  @Column({ unique: true })
  eventId: string;

  @CreateDateColumn()
  processedAt: Date;
}
