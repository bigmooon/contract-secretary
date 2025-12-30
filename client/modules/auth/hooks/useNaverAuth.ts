import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect } from 'react';
import { AuthService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import type { UseNaverAuthReturn } from '../types';

export function useNaverAuth(): UseNaverAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    logout: storeLogout,
    loadAuth,
    setLoading,
    setError,
    setTokens,
  } = useAuthStore();

  /**
   * 저장된 인증 정보 불러오기
   */
  const loadStoredAuth = useCallback(async () => {
    if (!isInitialized) {
      await loadAuth();
    }
  }, [isInitialized, loadAuth]);

  /**
   * 네이버 로그인 시작 (직접 네이버 OAuth 호출)
   */
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 네이버 OAuth URL 직접 생성 (서버 세션 우회)
      const { authUrl, state, appCallbackUrl } =
        await AuthService.generateNaverAuthUrl();

      // 서버에 앱 콜백 URL을 state와 함께 인코딩하여 전달
      // state 형식: {originalState}|{base64EncodedAppCallbackUrl}
      const encodedCallback = btoa(appCallbackUrl);
      const combinedState = `${state}|${encodedCallback}`;

      // state 업데이트 (검증용)
      const { setCodeVerifier } = await import('@/modules/common/api/token');
      await setCodeVerifier(state); // 원본 state만 저장

      // authUrl의 state 파라미터를 combinedState로 교체
      const authUrlObj = new URL(authUrl);
      authUrlObj.searchParams.set('state', combinedState);
      const finalAuthUrl = authUrlObj.toString();

      console.log('[NaverAuth] Opening naver auth URL:', finalAuthUrl);
      console.log('[NaverAuth] App callback URL:', appCallbackUrl);
      console.log('[NaverAuth] State:', state);

      // 웹 브라우저로 네이버 인증 페이지 직접 열기
      // 참고: 딥링크 리스너가 콜백을 처리하므로 여기서는 결과만 확인
      const result = await WebBrowser.openAuthSessionAsync(
        finalAuthUrl,
        appCallbackUrl
      );

      console.log('[NaverAuth] WebBrowser result:', result.type);

      // 딥링크 리스너가 이미 콜백을 처리했으므로 여기서는 취소만 처리
      // success 케이스는 딥링크 핸들러에서 처리됨
      if (result.type === 'cancel') {
        console.log('[NaverAuth] User cancelled login');
        setLoading(false);
      }
      // result.type === 'success'인 경우 딥링크 핸들러가 이미 처리했으므로 무시
    } catch (err) {
      console.error('[NaverAuth] Login failed:', err);
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // 서버에 로그아웃 요청 (선택적)
      const { refreshToken } = await AuthService.getStoredTokens();

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      // 로컬 토큰 삭제 및 상태 초기화
      await AuthService.clearTokens();
      await storeLogout();
    } catch (err) {
      console.error('Logout failed:', err);
      // 에러가 발생해도 로컬 토큰은 삭제
      await AuthService.clearTokens();
      await storeLogout();
    }
  }, [storeLogout, setLoading]);

  /**
   * 토큰 갱신
   */
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const { refreshToken } = await AuthService.getStoredTokens();

      if (!refreshToken) {
        return false;
      }

      const data = await AuthService.refreshTokens(refreshToken);

      // 새 토큰 저장
      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      await storeLogout();
      return false;
    }
  }, [storeLogout, setTokens]);

  // 앱 시작 시 저장된 인증 정보 불러오기
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // 딥링크 콜백은 app/auth/callback.tsx에서 처리됨
  // Expo Router가 자동으로 딥링크를 해당 화면으로 라우팅함

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    logout,
    refreshTokens,
  };
}
