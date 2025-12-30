import { Text } from '@/design-system';
import { Button } from '@/design-system/components/button';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNaverAuth } from '@/modules/auth/hooks/useNaverAuth';

import logoIcon from '@/assets/icons/logo-icon.svg';
import logoText from '@/assets/icons/logo-text.svg';

import { get } from '@/modules/common/api/base.api';
import { API_CONFIG } from '@/modules/common/api/config/api.config';

export default function Login() {
  const { login, isLoading, error } = useNaverAuth();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleApiTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      // 간단한 헬스체크 엔드포인트 테스트
      const result = await get<{ message?: string; status?: string }>(
        '/health'
      );
      setTestResult(
        `✅ 성공!\n${JSON.stringify(result, null, 2)}\n\n플랫폼: ${
          Platform.OS
        }\n요청 URL: /health\n기본 URL: ${API_CONFIG.baseUrl}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setTestResult(
        `❌ 실패!\n${errorMessage}\n\n플랫폼: ${Platform.OS}\n요청 URL: /health\n기본 URL: ${API_CONFIG.baseUrl}`
      );
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.logoWrapper}>
        <Image source={logoIcon} style={styles.logoIcon} contentFit="fill" />
        <Image source={logoText} style={styles.logoText} contentFit="fill" />
      </View>
      <View style={styles.buttonWrapper}>
        {error && (
          <View style={styles.errorContainer}>
            <Text variant="caption" style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}
        <Button
          onPress={login}
          disabled={isLoading}
          loading={isLoading}
          variant="naver"
          size="lg"
          fullWidth
        >
          네이버로 시작하기
        </Button>
        <Button
          onPress={handleApiTest}
          disabled={testLoading}
          loading={testLoading}
          variant="outline"
          size="sm"
          fullWidth
        >
          API 연결 테스트
        </Button>
        {testResult && (
          <View style={styles.testResultContainer}>
            <Text variant="caption" style={styles.testResultText}>
              {testResult}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    width: 150,
    height: 150,
    marginBottom: -70,
  },
  logoText: {
    width: 200,
    height: 200,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: '83%',
    marginTop: -20,
    gap: 10,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  testResultContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 8,
  },
  testResultText: {
    color: '#1F2937',
    textAlign: 'left',
    fontFamily: 'monospace',
    fontSize: 11,
  },
});
