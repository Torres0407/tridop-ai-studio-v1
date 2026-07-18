import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly repo: Repository<BookingEntity>,
    @InjectQueue('events') private readonly eventsQueue: Queue,
  ) {}

  async create(data: Partial<BookingEntity>): Promise<BookingEntity> {
    // Check availability: no overlapping bookings for same site
    const conflict = await this.repo.findOne({
      where: {
        siteId: data.siteId,
        startTime: Between(data.startTime, data.endTime),
      },
    });
    if (conflict) throw new Error('Time slot already booked');

    const booking = this.repo.create(data);
    const saved = await this.repo.save(booking);

    // Notify engagement-service via BullMQ
    await this.eventsQueue.add('BOOKING_CREATED', { bookingId: saved.id, siteId: saved.siteId });

    return saved;
  }

  async findAll(siteId: string): Promise<BookingEntity[]> {
    return this.repo.find({ where: { siteId }, order: { startTime: 'ASC' } });
  }

  async update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity> {
    await this.repo.update({ id }, data);
    return this.repo.findOne({ where: { id } });
  }

  async cancel(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async deleteBookingsBySite(siteId: string): Promise<void> {
    await this.repo.delete({ siteId });
  }
}
