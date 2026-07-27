import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  siteId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNumber()
  price!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  siteId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
}
