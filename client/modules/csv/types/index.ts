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
