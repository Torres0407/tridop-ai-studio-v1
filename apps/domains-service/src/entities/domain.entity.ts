import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('domains', { schema: 'domains' })
export class DomainEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  domain: string;

  @Column('uuid')
  siteId: string;

  @Column({ type: 'enum', enum: ['subdomain', 'registered', 'connected', 'suspended'] })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
