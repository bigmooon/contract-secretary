import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators';
import { MessageResponseDto } from '../auth/dto';
import { JwtAuthGuard } from '../auth/guards';
import { ContractsService } from './contracts.service';
import {
  ContractQueryDto,
  ContractResponseDto,
  CreateContractDto,
  PaginatedContractsResponseDto,
  UpdateContractDto,
} from './dto';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: '계약 생성' })
  @ApiResponse({
    status: 201,
    description: '계약이 생성되었습니다.',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({
    status: 403,
    description: '매물에 대한 접근 권한이 없습니다.',
  })
  @ApiResponse({ status: 404, description: '매물을 찾을 수 없습니다.' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createContractDto: CreateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.create(userId, createContractDto);
  }

  @Get()
  @ApiOperation({ summary: '계약 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '계약 목록을 반환합니다.',
    type: PaginatedContractsResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: ContractQueryDto,
  ): Promise<PaginatedContractsResponseDto> {
    return this.contractsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '계약 상세 조회' })
  @ApiParam({ name: 'id', description: '계약 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '계약 상세 정보를 반환합니다.',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({ status: 403, description: '접근 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '계약을 찾을 수 없습니다.' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractResponseDto> {
    return this.contractsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '계약 수정' })
  @ApiParam({ name: 'id', description: '계약 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '계약이 수정되었습니다.',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({ status: 403, description: '접근 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '계약을 찾을 수 없습니다.' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.update(userId, id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '계약 삭제' })
  @ApiParam({ name: 'id', description: '계약 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '계약이 삭제되었습니다.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({ status: 403, description: '접근 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '계약을 찾을 수 없습니다.' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    await this.contractsService.remove(userId, id);
    return { message: '계약이 삭제되었습니다.' };
  }
}
