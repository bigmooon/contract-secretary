import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { CsvService } from '../services/csv.service';
import type {
  CsvImportResult,
  CsvPreviewResult,
  ColumnMapping,
  PickedFile,
} from '../types';

/**
 * 파일 선택 → 미리보기(컬럼 자동추측) → 매핑 확인 → 가져오기 흐름 훅.
 * 화면(app/csv/import)에서 사용한다.
 */
export function useCsvImportFlow() {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  /** 파일 선택 후 미리보기 요청. 취소하면 false. */
  const pickAndPreview = useCallback(async (): Promise<boolean> => {
    // ponytail: '*/*' 허용 — Android는 .csv를 octet-stream으로 보고해 MIME 필터 시
    // 사용자가 자기 파일을 못 고르는 문제가 잦다. 검증은 서버가 담당.
    const picked = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (picked.canceled || !picked.assets?.[0]) return false;

    const asset = picked.assets[0];
    const nextFile: PickedFile = {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
    };
    setFile(nextFile);
    setIsLoading(true);
    try {
      const result = await CsvService.previewFile(nextFile);
      setPreview(result);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** 확정된 매핑으로 실제 가져오기 */
  const runImport = useCallback(
    async (mapping: ColumnMapping): Promise<CsvImportResult | null> => {
      if (!file) return null;
      setIsImporting(true);
      try {
        return await CsvService.importFile(file, mapping);
      } finally {
        setIsImporting(false);
      }
    },
    [file]
  );

  return { file, preview, isLoading, isImporting, pickAndPreview, runImport };
}

/**
 * 매물 데이터 내보내기 → 파일 저장 후 공유 시트 열기 훅
 */
export function useCsvExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToFile = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await CsvService.exportFile();
      const base64 = result.data.split('base64,')[1] ?? '';
      const fileUri = `${FileSystem.cacheDirectory}${result.fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: '매물 데이터 내보내기',
          UTI: 'public.comma-separated-values-text',
        });
      }

      return result;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToFile, isExporting };
}
