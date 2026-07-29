import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings', { schema: 'owner' })
export class PlatformSettingsEntity {
  @PrimaryColumn({ type: 'varchar', default: 'global' })
  id: string;

  @Column({ default: false })
  killSwitchActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  featureFlags: Record<string, boolean>;

  @UpdateDateColumn()
  updatedAt: Date;
}
