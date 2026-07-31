import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('feature_flags', { schema: 'owner' })
export class FeatureFlagEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ default: false })
  enabled: boolean;
}
