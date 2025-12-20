import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateStakeholderDto } from './stakeholder.dto';

export class CreateContractDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '매물 ID',
  })
  @IsUUID('4', { message: '올바른 매물 ID 형식이 아닙니다.' })
  @IsNotEmpty({ message: '매물 ID는 필수 입력 항목입니다.' })
  propertyId: string;

  @ApiProperty({
    example: 'JEONSE',
    description: '계약 유형 (JEONSE: 전세, WOLSE: 월세, MAEMAE: 매매)',
    enum: ContractType,
  })
  @IsEnum(ContractType, {
    message: '계약 유형은 JEONSE, WOLSE, MAEMAE 중 하나여야 합니다.',
  })
  contractType: ContractType;

  @ApiProperty({
    example: '300000000',
    description: '보증금 (원 단위, 문자열로 전송 - BigInt 처리)',
  })
  @IsString({ message: '보증금 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '보증금은 필수 입력 항목입니다.' })
  depositPrice: string;

  @ApiPropertyOptional({
    example: '500000',
    description: '월세 (원 단위, 문자열로 전송 - 월세 계약시 필수)',
    default: '0',
  })
  @IsOptional()
  @IsString({ message: '월세 형식이 올바르지 않습니다.' })
  monthlyRent?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: '계약일 (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: '계약일 형식이 올바르지 않습니다. (YYYY-MM-DD)' },
  )
  contractDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-14',
    description: '만기일 (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: '만기일 형식이 올바르지 않습니다. (YYYY-MM-DD)' },
  )
  expirationDate?: string;

  @ApiPropertyOptional({
    example: '특약사항 있음',
    description: '메모 (선택)',
  })
  @IsOptional()
  @IsString({ message: '메모 형식이 올바르지 않습니다.' })
  memo?: string;

  @ApiProperty({
    type: [CreateStakeholderDto],
    description: '이해관계자 목록 (최소 1명 이상)',
  })
  @IsArray({ message: '이해관계자 목록은 배열이어야 합니다.' })
  @ArrayMinSize(1, { message: '최소 1명 이상의 이해관계자가 필요합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateStakeholderDto)
  stakeholders: CreateStakeholderDto[];
}
