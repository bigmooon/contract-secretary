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

export class CsvFieldDto {
  @ApiProperty({ example: 'complexName', description: '내부 필드 키' })
  key: string;

  @ApiProperty({ example: '아파트명', description: '화면에 보일 라벨' })
  label: string;

  @ApiProperty({ example: true, description: '매핑 필수 여부' })
  required: boolean;
}

export class CsvPreviewResponseDto {
  @ApiProperty({
    example: ['아파트명', '동', '호수', '보증금'],
    description: '업로드 파일의 컬럼 헤더',
  })
  headers: string[];

  @ApiProperty({ type: [CsvFieldDto], description: '매핑 대상 필드 목록' })
  fields: CsvFieldDto[];

  @ApiProperty({
    example: { complexName: '아파트명', buildingName: '동' },
    description: '필드 → 파일 컬럼 자동추측 매핑 (필드키: 컬럼명)',
  })
  mapping: Record<string, string>;

  @ApiProperty({
    example: [{ 아파트명: '래미안', 동: '101', 호수: '1502' }],
    description: '미리보기용 샘플 행 (최대 3행)',
  })
  sampleRows: Record<string, string>[];

  @ApiProperty({ example: 50, description: '총 데이터 행 수' })
  totalRows: number;
}
