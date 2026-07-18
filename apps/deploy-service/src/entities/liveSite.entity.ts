import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('live_sites', { schema: 'deploy' })
export class LiveSiteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  siteId: string;

  @Column()
  domain: string;

  @Column({ default: false })
  hasCustomDomain: boolean;

  @CreateDateColumn()
  deployedAt: Date;
}
