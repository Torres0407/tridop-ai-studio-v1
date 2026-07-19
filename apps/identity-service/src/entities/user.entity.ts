import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'users', schema: 'identity' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ type: 'varchar', default: 'user' })
  role!: string;

  @Column({ type: 'varchar', default: 'local' })
  oauthProvider!: string;

  @Column({ type: 'varchar', nullable: true })
  oauthId!: string | null;

  @Column({ type: 'boolean', default: false })
  isSuspended!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
