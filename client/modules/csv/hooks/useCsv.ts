import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { CsvService } from '../services/csv.service';
import type { CsvImportResult } from '../types';

/**
 * 파일 선택 → 서버 업로드(가져오기) 훅
 * @param onSuccess 가져오기 성공 시 콜백 (예: 매물 목록 새로고침)
 */
export function useCsvImport(onSuccess?: () => void) {
  const [isImporting, setIsImporting] = useState(false);

  const importFromFile = useCallback(async (): Promise<CsvImportResult | null> => {
    // ponytail: '*/*' 허용 — Android는 .csv를 octet-stream으로 보고해 MIME 필터 시
    // 사용자가 자기 파일을 못 고르는 문제가 잦다. 검증은 서버가 담당.
    const picked = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (picked.canceled || !picked.assets?.[0]) return null;

    const asset = picked.assets[0];
    setIsImporting(true);
    try {
      const result = await CsvService.importFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      onSuccess?.();
      return result;
    } finally {
      setIsImporting(false);
    }
  }, [onSuccess]);

  return { importFromFile, isImporting };
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
