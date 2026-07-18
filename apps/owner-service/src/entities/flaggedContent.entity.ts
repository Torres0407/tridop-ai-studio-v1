import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('flagged_content', { schema: 'owner' })
export class FlaggedContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column({ default: 'pending' })
  status: string;
  @CreateDateColumn()
  createdAt: Date;
}
