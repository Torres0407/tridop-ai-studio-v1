import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class KillSwitchDto {
  @ApiProperty({ description: 'Whether the kill switch is active' })
  @IsBoolean()
  active!: boolean;
}
