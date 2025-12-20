import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContractSummaryDto {
  @ApiProperty({ example: '1234567890' })
  id: string;

  @ApiProperty({
    example: 'JEONSE',
    enum: ['JEONSE', 'WOLSE', 'MAEMAE'],
    description: '계약 유형',
  })
  contractType: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'EXPIRED', 'RENEWED', 'TERMINATED'],
    description: '계약 상태',
  })
  status: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: '만기일',
  })
  expirationDate?: string | null;

  @ApiPropertyOptional({
    example: 30,
    description: '만기까지 남은 일수 (음수면 만료됨)',
  })
  dDay?: number | null;

  @ApiPropertyOptional({
    example: 'D-30',
    description: 'D-day 배지 (D-7, D-30, D-90, EXPIRED, null)',
    enum: ['D-7', 'D-30', 'D-90', 'EXPIRED', null],
  })
  dDayBadge?: string | null;
}

export class PropertyResponseDto {
  @ApiProperty({ example: '1234567890' })
  id: string;

  @ApiProperty({ example: '반도유보라', description: '단지명' })
  complexName: string;

  @ApiProperty({ example: '101', description: '동' })
  buildingName: string;

  @ApiProperty({ example: '1201', description: '호수' })
  unitNo: string;

  @ApiPropertyOptional({ example: '32평/84A', description: '평수/타입' })
  typeInfo?: string | null;

  @ApiPropertyOptional({ example: '남향, 주차편리', description: '특이사항' })
  note?: string | null;

  @ApiProperty({ example: '2025-01-15T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T09:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: [ContractSummaryDto],
    description: '계약 목록 (includeContracts=true인 경우)',
  })
  contracts?: ContractSummaryDto[];
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

export class PaginatedPropertiesResponseDto {
  @ApiProperty({ type: [PropertyResponseDto], description: '매물 목록' })
  data: PropertyResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: '페이지네이션 정보' })
  meta: PaginationMetaDto;
}
