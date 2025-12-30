import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/design-system';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { AuthService } from '@/modules/auth/services/auth.service';

export default function DeepLinkCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }>();

  const { setAuth, setError } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[DeepLinkCallback] Received params:', params);

      if (params.error) {
        console.error('[DeepLinkCallback] OAuth error:', params.error);
        setError(params.error_description || params.error);
        router.replace('/(auth)/login');
        return;
      }

      if (params.code && params.state) {
        try {
          console.log('[DeepLinkCallback] Exchanging code for tokens...');
          const data = await AuthService.exchangeNaverCode(
            params.code,
            params.state
          );

          await setAuth(
            {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              provider: data.user.provider,
            },
            {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }
          );

          console.log('[DeepLinkCallback] Login successful, redirecting to home');
          router.replace('/(tabs)');
        } catch (err) {
          console.error('[DeepLinkCallback] Token exchange failed:', err);
          setError(
            err instanceof Error ? err.message : '로그인에 실패했습니다.'
          );
          router.replace('/(auth)/login');
        }
      } else {
        console.log('[DeepLinkCallback] Missing code or state, redirecting to login');
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params.code, params.state, params.error]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#03C75A" />
      <Text variant="body" style={{ marginTop: 16 }}>
        로그인 처리 중... 
      </Text>
    </View>
  );
}
