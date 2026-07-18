import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AgencyEntity } from './agency.entity';

@Entity('agency_clients', { schema: 'billing' })
export class AgencyClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgencyEntity)
  @JoinColumn({ name: 'agencyId' })
  agency: AgencyEntity;

  @Column('uuid')
  agencyId: string;

  @Column('uuid', { unique: true })
  clientUserId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  joinedAt: Date;
}
