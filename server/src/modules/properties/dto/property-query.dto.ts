import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PropertyQueryDto {
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
    example: '반도',
    description: '단지명/동/호수 검색어',
  })
  @IsOptional()
  @IsString({ message: '검색어 형식이 올바르지 않습니다.' })
  search?: string;

  @ApiPropertyOptional({
    example: '반도유보라',
    description: '단지명으로 필터링',
  })
  @IsOptional()
  @IsString({ message: '단지명 형식이 올바르지 않습니다.' })
  complexName?: string;

  @ApiPropertyOptional({
    example: true,
    description: '계약 정보 포함 여부',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: '계약 정보 포함 여부는 boolean이어야 합니다.' })
  includeContracts?: boolean = false;
}
