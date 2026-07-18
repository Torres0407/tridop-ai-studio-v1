import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('agencies', { schema: 'billing' })
export class AgencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  ownerUserId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column('decimal', { precision: 5, scale: 2, default: 20 })
  marginPercent: number; // The agency's markup over the base plan price

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
