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
import {
  CreatePropertyDto,
  PaginatedPropertiesResponseDto,
  PropertyQueryDto,
  PropertyResponseDto,
  UpdatePropertyDto,
} from './dto';
import { PropertiesService } from './properties.service';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: '매물 생성' })
  @ApiResponse({
    status: 201,
    description: '매물이 등록되었습니다.',
    type: PropertyResponseDto,
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
    @Body() createPropertyDto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.create(userId, createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: '매물 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '매물 목록이 조회되었습니다.',
    type: PaginatedPropertiesResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PropertyQueryDto,
  ): Promise<PaginatedPropertiesResponseDto> {
    return this.propertiesService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '매물 상세 조회' })
  @ApiParam({ name: 'id', description: '매물 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '매물 상세 정보가 조회되었습니다.',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({
    status: 403,
    description: '매물에 대한 접근 권한이 없습니다.',
  })
  @ApiResponse({ status: 404, description: '매물을 찾을 수 없습니다.' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.findOne(userId, id, true);
  }

  @Patch(':id')
  @ApiOperation({ summary: '매물 수정' })
  @ApiParam({ name: 'id', description: '매물 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '매물 정보가 수정되었습니다.',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({
    status: 403,
    description: '매물에 대한 접근 권한이 없습니다.',
  })
  @ApiResponse({ status: 404, description: '매물을 찾을 수 없습니다.' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ): Promise<PropertyResponseDto> {
    return this.propertiesService.update(userId, id, updatePropertyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '매물 삭제' })
  @ApiParam({ name: 'id', description: '매물 ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: '매물이 삭제되었습니다.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: '올바르지 않은 요청입니다.' })
  @ApiResponse({ status: 401, description: '인증이 필요합니다.' })
  @ApiResponse({
    status: 403,
    description: '매물에 대한 접근 권한이 없습니다.',
  })
  @ApiResponse({ status: 404, description: '매물을 찾을 수 없습니다.' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    await this.propertiesService.remove(userId, id);
    return { message: '매물이 삭제되었습니다.' };
  }
}
