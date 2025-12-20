import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ContractStatus, ContractType } from '@prisma/client';

export enum ExpirationFilter {
  ALL = 'ALL',
  D7 = 'D7',
  D30 = 'D30',
  D90 = 'D90',
  EXPIRED = 'EXPIRED',
  UPCOMING = 'UPCOMING',
}

export class ContractQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호 (1부터 시작)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 번호는 정수여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: '페이지당 항목 수',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지당 항목 수는 정수여야 합니다.' })
  @Min(1, { message: '페이지당 항목 수는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지당 항목 수는 100 이하여야 합니다.' })
  limit?: number = 20;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '매물 ID로 필터링',
  })
  @IsOptional()
  @IsUUID('4', { message: '올바른 매물 ID 형식이 아닙니다.' })
  propertyId?: string;

  @ApiPropertyOptional({
    example: 'JEONSE',
    description: '계약 유형으로 필터링',
    enum: ContractType,
  })
  @IsOptional()
  @IsEnum(ContractType, {
    message: '계약 유형은 JEONSE, WOLSE, MAEMAE 중 하나여야 합니다.',
  })
  contractType?: ContractType;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: '계약 상태로 필터링',
    enum: ContractStatus,
  })
  @IsOptional()
  @IsEnum(ContractStatus, {
    message:
      '계약 상태는 ACTIVE, EXPIRED, RENEWED, TERMINATED 중 하나여야 합니다.',
  })
  status?: ContractStatus;

  @ApiPropertyOptional({
    example: 'D30',
    description:
      '만기일 필터 (D7: 7일 이내, D30: 30일 이내, D90: 90일 이내, EXPIRED: 만료됨, UPCOMING: 90일 이내)',
    enum: ExpirationFilter,
  })
  @IsOptional()
  @IsEnum(ExpirationFilter, {
    message:
      '만기일 필터는 ALL, D7, D30, D90, EXPIRED, UPCOMING 중 하나여야 합니다.',
  })
  expirationFilter?: ExpirationFilter;

  @ApiPropertyOptional({
    example: '반도',
    description: '단지명/동/호수 검색어',
  })
  @IsOptional()
  @IsString({ message: '검색어 형식이 올바르지 않습니다.' })
  search?: string;
}
