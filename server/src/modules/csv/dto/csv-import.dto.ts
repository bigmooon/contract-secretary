import { ApiProperty } from '@nestjs/swagger';

export class CsvImportResponseDto {
  @ApiProperty({ example: true, description: '성공 여부' })
  success: boolean;

  @ApiProperty({ example: 'file.csv', description: '업로드된 파일명' })
  fileName: string;

  @ApiProperty({ example: 50, description: '총 데이터 행 수' })
  totalRows: number;

  @ApiProperty({ example: 48, description: '성공적으로 저장된 행 수' })
  successCount: number;

  @ApiProperty({ example: 2, description: '실패한 행 수' })
  failedCount: number;

  @ApiProperty({
    example: [{ row: 5, error: '보증금 형식이 올바르지 않습니다.' }],
    description: '실패한 행 정보 (선택)',
    required: false,
  })
  errors?: { row: number; error: string }[];
}

export class CsvExportResponseDto {
  @ApiProperty({
    example: 'data:text/csv;charset=utf-8,...',
    description: 'CSV 파일 데이터 (Base64)',
  })
  data: string;

  @ApiProperty({ example: 'properties_export_20241227.csv' })
  fileName: string;

  @ApiProperty({ example: 50 })
  totalRows: number;
}
