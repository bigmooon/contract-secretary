/**
 * CSV/Excel Import Screen
 * 파일 선택 → 컬럼 자동추측 → 사용자가 매핑 확인/수정 → 가져오기
 * Route: /csv/import
 */

import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FormSelect } from '@/components/form';
import {
  Button,
  Text,
  View as ThemedView,
  spacing,
  useTheme,
} from '@/design-system';
import { useCsvImportFlow } from '@/modules/csv';
import type { ColumnMapping } from '@/modules/csv';
import { usePropertiesStore } from '@/modules/properties/stores/propertiesStore';

const NONE = '';

export default function CsvImportScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { preview, isLoading, isImporting, pickAndPreview, runImport } =
    useCsvImportFlow();

  const [mapping, setMapping] = useState<ColumnMapping>({});
  const startedRef = useRef(false);

  // 진입 즉시 파일 선택 → 미리보기. 취소하거나 실패하면 뒤로.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const ok = await pickAndPreview();
        if (!ok) router.back();
      } catch {
        Alert.alert(
          '미리보기 실패',
          'CSV 또는 엑셀 파일인지 확인해 주세요.',
          [{ text: '확인', onPress: () => router.back() }]
        );
      }
    })();
  }, [pickAndPreview, router]);

  // 자동추측 매핑을 초기값으로
  useEffect(() => {
    if (preview) setMapping(preview.mapping);
  }, [preview]);

  const setField = (key: string, column: string) => {
    setMapping((prev) => ({ ...prev, [key]: column }));
  };

  const missingRequired = preview
    ? preview.fields.filter((f) => f.required && !mapping[f.key])
    : [];

  const handleImport = async () => {
    if (missingRequired.length > 0) {
      Alert.alert(
        '필수 항목 확인',
        `${missingRequired.map((f) => f.label).join(', ')} 컬럼을 지정해 주세요.`
      );
      return;
    }

    try {
      const result = await runImport(mapping);
      if (!result) return;

      void usePropertiesStore.getState().refreshProperties();

      const failMsg = result.failedCount
        ? `\n실패 ${result.failedCount}건은 형식을 확인해 주세요.`
        : '';
      Alert.alert(
        '가져오기 완료',
        `총 ${result.totalRows}건 중 ${result.successCount}건을 저장했습니다.${failMsg}`,
        [{ text: '확인', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('가져오기 실패', '잠시 후 다시 시도해 주세요.');
    }
  };

  // 미리보기 로딩 중
  if (!preview) {
    return (
      <>
        <Stack.Screen options={{ title: '컬럼 연결' }} />
        <ThemedView style={[styles.container, styles.center]}>
          {isLoading && <ActivityIndicator color={theme.colors.primary} />}
        </ThemedView>
      </>
    );
  }

  // 컬럼 선택 옵션: '없음' + 파일 헤더들
  const columnOptions = [
    { label: '— 없음 —', value: NONE },
    ...preview.headers.map((h) => ({ label: h, value: h })),
  ];

  return (
    <>
      <Stack.Screen options={{ title: '컬럼 연결', headerBackTitle: '취소' }} />
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="body" style={{ color: theme.colors.textSecondary }}>
            파일의 컬럼을 각 항목에 연결해 주세요. 자동으로 맞춰둔 항목은 그대로
            두면 됩니다. (총 {preview.totalRows}건)
          </Text>

          <View style={styles.fields}>
            {preview.fields.map((field) => (
              <FormSelect
                key={field.key}
                label={field.required ? `${field.label} *` : field.label}
                options={columnOptions}
                value={mapping[field.key] ?? NONE}
                onChange={(value) => setField(field.key, value)}
              />
            ))}
          </View>

          <Button
            onPress={handleImport}
            loading={isImporting}
            disabled={missingRequired.length > 0}
            fullWidth
            size="lg"
            style={styles.importButton}
          >
            {`${preview.totalRows}건 가져오기`}
          </Button>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  fields: {
    marginTop: spacing[4],
  },
  importButton: {
    marginTop: spacing[6],
  },
});
