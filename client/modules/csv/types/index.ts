/**
 * CSV/Excel 가져오기·내보내기 타입
 * 서버 CsvImportResponseDto / CsvExportResponseDto와 일치
 */

export interface CsvImportError {
  row: number;
  error: string;
}

export interface CsvImportResult {
  success: boolean;
  fileName: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors?: CsvImportError[];
}

export interface CsvExportResult {
  /** data URI (data:text/csv;charset=utf-8;base64,...) */
  data: string;
  fileName: string;
  totalRows: number;
}

export interface PickedFile {
  uri: string;
  name: string;
  mimeType?: string;
}

/** 필드 → 사용자 파일의 실제 컬럼명 (서버 ColumnMapping과 일치) */
export type ColumnMapping = Record<string, string>;

export interface CsvField {
  key: string;
  label: string;
  required: boolean;
}

/** 서버 CsvPreviewResponseDto와 일치 */
export interface CsvPreviewResult {
  headers: string[];
  fields: CsvField[];
  mapping: ColumnMapping;
  sampleRows: Record<string, string>[];
  totalRows: number;
}
