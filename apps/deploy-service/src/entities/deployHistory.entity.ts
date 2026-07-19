import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('deploy_history', { schema: 'deploy' })
export class DeployHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  siteId: string;

  @Column({ nullable: true })
  versionId: string;

  @Column()
  status: string; // e.g., 'pending', 'success', 'failed', 'rolled_back'

  @CreateDateColumn()
  timestamp: Date;
}
