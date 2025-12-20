import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({
    example: '반도유보라',
    description: '아파트/건물 단지명',
    maxLength: 100,
  })
  @IsString({ message: '단지명 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '단지명은 필수 입력 항목입니다.' })
  @MaxLength(100, { message: '단지명은 최대 100자까지 입력 가능합니다.' })
  complexName: string;

  @ApiProperty({
    example: '101',
    description: '동',
    maxLength: 20,
  })
  @IsString({ message: '동 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '동은 필수 입력 항목입니다.' })
  @MaxLength(20, { message: '동은 최대 20자까지 입력 가능합니다.' })
  buildingName: string;

  @ApiProperty({
    example: '1201',
    description: '호수',
    maxLength: 20,
  })
  @IsString({ message: '호수 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '호수는 필수 입력 항목입니다.' })
  @MaxLength(20, { message: '호수는 최대 20자까지 입력 가능합니다.' })
  unitNo: string;

  @ApiPropertyOptional({
    example: '32평/84A',
    description: '평수/타입 (선택)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '평수/타입 형식이 올바르지 않습니다.' })
  @MaxLength(50, { message: '평수/타입은 최대 50자까지 입력 가능합니다.' })
  typeInfo?: string;

  @ApiPropertyOptional({
    example: '남향, 주차편리',
    description: '특이사항 메모 (선택)',
  })
  @IsOptional()
  @IsString({ message: '특이사항 형식이 올바르지 않습니다.' })
  note?: string;
}
