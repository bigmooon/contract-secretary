import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CsvService } from './csv.service';
import { CsvImportResponseDto, CsvExportResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@ApiTags('CSV')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'CSV/Excel 파일 임포트',
    description:
      '매물 데이터가 포함된 CSV 또는 Excel(xls, xlsx) 파일을 업로드하여 DB에 저장합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV 또는 Excel 파일 (최대 10MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일 임포트 성공',
    type: CsvImportResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 파일 형식 또는 데이터' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async importFile(
    @CurrentUser('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType:
              /(text\/csv|application\/vnd.ms-excel|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<CsvImportResponseDto> {
    return this.csvService.importFile(userId, file);
  }

  @Get('export')
  @ApiOperation({
    summary: '매물 데이터 CSV 내보내기',
    description: '현재 사용자의 모든 매물 데이터를 CSV 형식으로 내보냅니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV 내보내기 성공',
    type: CsvExportResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async exportFile(
    @CurrentUser('userId') userId: string,
  ): Promise<CsvExportResponseDto> {
    return this.csvService.exportFile(userId);
  }
}
