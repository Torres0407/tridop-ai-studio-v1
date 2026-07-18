import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bookings', { schema: 'commerce' })
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  siteId: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
