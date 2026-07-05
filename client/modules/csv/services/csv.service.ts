import { get, post, API_ENDPOINTS } from '@/modules/common/api';
import type {
  CsvImportResult,
  CsvExportResult,
  CsvPreviewResult,
  ColumnMapping,
  PickedFile,
} from '../types';

/**
 * 파일명 확장자로 MIME 타입을 결정한다.
 * 서버의 FileTypeValidator가 mimeType을 엄격히 검사하므로,
 * 기기(특히 Android)가 보고하는 부정확한 mimeType 대신 확장자를 신뢰한다.
 */
function mimeTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx')
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === 'xls') return 'application/vnd.ms-excel';
  return 'text/csv';
}

/**
 * CSV/Excel 가져오기·내보내기 서버 통신
 */
export class CsvService {
  /**
   * FormData에 선택 파일을 RN 형식({ uri, name, type })으로 추가
   */
  private static appendFile(formData: FormData, file: PickedFile): void {
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: mimeTypeFromName(file.name),
    } as unknown as Blob);
  }

  /**
   * 파일을 업로드해 헤더·자동추측 매핑·샘플 행을 받는다 (저장 안 함)
   */
  static async previewFile(file: PickedFile): Promise<CsvPreviewResult> {
    const formData = new FormData();
    this.appendFile(formData, file);

    return post<CsvPreviewResult>(API_ENDPOINTS.csv.preview, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * 선택한 파일을 서버에 업로드하여 매물 데이터로 저장
   * @param columnMapping 필드→컬럼 매핑 (생략 시 서버가 자동추측)
   */
  static async importFile(
    file: PickedFile,
    columnMapping?: ColumnMapping,
  ): Promise<CsvImportResult> {
    const formData = new FormData();
    this.appendFile(formData, file);
    if (columnMapping) {
      formData.append('columnMapping', JSON.stringify(columnMapping));
    }

    return post<CsvImportResult>(API_ENDPOINTS.csv.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * 현재 사용자의 매물 데이터를 CSV(base64 data URI)로 내려받기
   */
  static async exportFile(): Promise<CsvExportResult> {
    return get<CsvExportResult>(API_ENDPOINTS.csv.export);
  }
}
