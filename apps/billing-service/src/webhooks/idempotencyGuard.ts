import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedWebhookEventEntity } from '../entities/processedWebhookEvent.entity';

@Injectable()
export class IdempotencyGuard {
  constructor(
    @InjectRepository(ProcessedWebhookEventEntity)
    private readonly repo: Repository<ProcessedWebhookEventEntity>
  ) {}

  async checkAndRecord(provider: string, eventId: string): Promise<boolean> {
    try {
      const existing = await this.repo.findOne({ where: { provider, eventId } });
      if (existing) return true; // Already processed
      
      const record = this.repo.create({ id: crypto.randomUUID(), provider, eventId });
      await this.repo.save(record);
      return false; // Not processed yet
    } catch (e: any) {
      if (e.code === '23505') return true; // Unique constraint violation (race condition safe)
      throw e;
    }
  }
}
