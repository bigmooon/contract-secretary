import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/design-system';
import { useAuthStore } from '@/modules/auth/stores/authStore';

// 폰트 로딩 전에 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isInitialized, loadAuth } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  });

  // 앱 시작 시 저장된 인증 정보 로드
  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // 폰트 로드 완료 및 인증 초기화 완료 시 스플래시 숨기기
  useEffect(() => {
    if ((fontsLoaded || fontError) && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isInitialized]);

  // 인증 상태에 따른 리다이렉트
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // 로그인 상태인데 로그인 화면에 있으면 홈으로 이동
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // 로그아웃 상태인데 보호된 화면에 있으면 로그인으로 이동
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  // 폰트 로딩 중이거나 인증 초기화 중이면 아무것도 렌더링하지 않음
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/callback"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
        <Stack.Screen
          name="property/[id]"
          options={{
            headerShown: true,
            title: '매물 상세',
          }}
        />
        <Stack.Screen
          name="property/edit/[id]"
          options={{
            headerShown: true,
            title: '매물 수정',
          }}
        />
        <Stack.Screen
          name="property/add"
          options={{
            headerShown: true,
            title: '매물 등록',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
