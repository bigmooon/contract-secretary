import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ContractStatus } from '@prisma/client';
import { CreateContractDto } from './create-contract.dto';
import { CreateStakeholderDto } from './stakeholder.dto';

export class UpdateContractDto extends PartialType(
  OmitType(CreateContractDto, ['propertyId'] as const),
) {
  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: '계약 상태',
    enum: ContractStatus,
  })
  @IsOptional()
  @IsEnum(ContractStatus, {
    message:
      '계약 상태는 ACTIVE, EXPIRED, RENEWED, TERMINATED 중 하나여야 합니다.',
  })
  status?: ContractStatus;

  @ApiPropertyOptional({
    type: [CreateStakeholderDto],
    description: '이해관계자 목록 (전체 교체)',
  })
  @IsOptional()
  @IsArray({ message: '이해관계자 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => CreateStakeholderDto)
  stakeholders?: CreateStakeholderDto[];
}
