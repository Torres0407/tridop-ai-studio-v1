import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('owner_action_log', { schema: 'owner' })
export class OwnerActionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  action: string;
  @CreateDateColumn()
  createdAt: Date;
}
