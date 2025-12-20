import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StakeholderResponseDto } from './stakeholder.dto';

export class PropertySummaryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '반도유보라', description: '단지명' })
  complexName: string;

  @ApiProperty({ example: '101', description: '동' })
  buildingName: string;

  @ApiProperty({ example: '1201', description: '호수' })
  unitNo: string;

  @ApiPropertyOptional({ example: '32평/84A', description: '평수/타입' })
  typeInfo?: string | null;
}

export class ContractResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  propertyId: string;

  @ApiProperty({
    example: 'JEONSE',
    enum: ['JEONSE', 'WOLSE', 'MAEMAE'],
    description: '계약 유형',
  })
  contractType: string;

  @ApiProperty({ example: '300000000', description: '보증금 (문자열)' })
  depositPrice: string;

  @ApiProperty({ example: '500000', description: '월세 (문자열)' })
  monthlyRent: string;

  @ApiPropertyOptional({ example: '2024-01-15', description: '계약일' })
  contractDate?: string | null;

  @ApiPropertyOptional({ example: '2026-01-14', description: '만기일' })
  expirationDate?: string | null;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'EXPIRED', 'RENEWED', 'TERMINATED'],
    description: '계약 상태',
  })
  status: string;

  @ApiPropertyOptional({ example: '특약사항 있음', description: '메모' })
  memo?: string | null;

  @ApiPropertyOptional({
    example: 30,
    description: '만기까지 남은 일수 (음수면 만료됨)',
  })
  dDay?: number | null;

  @ApiPropertyOptional({
    example: 'D-30',
    description: 'D-day 배지',
    enum: ['D-7', 'D-30', 'D-90', 'EXPIRED', null],
  })
  dDayBadge?: string | null;

  @ApiProperty({ example: '2025-01-15T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T09:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: PropertySummaryDto, description: '매물 정보' })
  property?: PropertySummaryDto;

  @ApiProperty({
    type: [StakeholderResponseDto],
    description: '이해관계자 목록',
  })
  stakeholders: StakeholderResponseDto[];
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: '현재 페이지' })
  page: number;

  @ApiProperty({ example: 20, description: '페이지당 항목 수' })
  limit: number;

  @ApiProperty({ example: 150, description: '전체 항목 수' })
  total: number;

  @ApiProperty({ example: 8, description: '전체 페이지 수' })
  totalPages: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: '이전 페이지 존재 여부' })
  hasPreviousPage: boolean;
}

export class PaginatedContractsResponseDto {
  @ApiProperty({ type: [ContractResponseDto], description: '계약 목록' })
  data: ContractResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: '페이지네이션 정보' })
  meta: PaginationMetaDto;
}
