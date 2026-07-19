import { IsString, IsNotEmpty, IsObject, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty()
  @IsObject()
  config!: any;
}

export class UpdateSiteDto {
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  config?: any;
}

export class CreateRecordDto {
  @ApiProperty()
  @IsObject()
  data!: any;
}

export class UpdateRecordDto {
  @ApiProperty()
  @IsObject()
  update!: any;
}

export class UpdateBlockDto {
  @ApiProperty()
  @IsObject()
  content!: any;

  @ApiProperty()
  @IsNumber()
  version!: number;
}

export class CreateVersionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class ApplyTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId!: string;
}
