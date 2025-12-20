import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StakeholderRole } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateStakeholderDto {
  @ApiProperty({
    example: 'OWNER',
    description: '역할 (OWNER: 임대인, TENANT: 임차인)',
    enum: StakeholderRole,
  })
  @IsEnum(StakeholderRole, {
    message: '역할은 OWNER 또는 TENANT이어야 합니다.',
  })
  role: StakeholderRole;

  @ApiPropertyOptional({
    example: '김철수',
    description: '이름 (선택)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '이름 형식이 올바르지 않습니다.' })
  @MaxLength(50, { message: '이름은 최대 50자까지 입력 가능합니다.' })
  name?: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '전화번호',
    maxLength: 20,
  })
  @IsString({ message: '전화번호 형식이 올바르지 않습니다.' })
  @IsNotEmpty({ message: '전화번호는 필수 입력 항목입니다.' })
  @MaxLength(20, { message: '전화번호는 최대 20자까지 입력 가능합니다.' })
  @Matches(/^[0-9-]+$/, {
    message: '전화번호는 숫자와 하이픈만 입력 가능합니다.',
  })
  phone: string;
}

export class StakeholderResponseDto {
  @ApiProperty({ example: '1234567890' })
  id: string;

  @ApiProperty({ example: 'OWNER', enum: StakeholderRole })
  role: StakeholderRole;

  @ApiPropertyOptional({ example: '김철수' })
  name?: string | null;

  @ApiProperty({ example: '010-1234-5678' })
  phone: string;
}
