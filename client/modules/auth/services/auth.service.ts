import {
  API_CONFIG,
  API_ENDPOINTS,
  post,
} from '@/modules/common/api';
import {
  clearAllTokens,
  getAccessToken,
  getCodeVerifier,
  getRefreshToken,
  getUserId,
  removeCodeVerifier,
  saveTokens,
  setCodeVerifier,
} from '@/modules/common/api/token';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import type { AuthUser } from '../types';

// 네이버 OAuth 설정 (공개 정보)
const NAVER_CLIENT_ID = 'Fw5dwrGuqotBaexjmFdt';
const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';

interface TokenExchangeResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 인증 서비스
 * common/api 모듈의 유틸리티를 활용하여 인증 관련 API 호출을 처리합니다.
 */
export class AuthService {
  /**
   * 네이버 OAuth 코드를 서버에 전송하여 JWT 토큰 교환 (모바일 앱용)
   */
  static async exchangeNaverCode(
    code: string,
    state: string
  ): Promise<TokenExchangeResponse> {
    console.log('[AuthService] Exchanging naver code for tokens');

    // state 검증 (CSRF 방지)
    const savedState = await getCodeVerifier();
    if (!savedState || savedState !== state) {
      console.error('[AuthService] State mismatch!', {
        savedState: savedState ? 'exists' : 'missing',
        returnedState: state,
      });
      throw new Error('인증 상태가 일치하지 않습니다. 다시 시도해주세요.');
    }

    const data = await post<TokenExchangeResponse>(
      API_ENDPOINTS.auth.naverToken,
      {
        code,
        state,
      }
    );

    // state 삭제
    await removeCodeVerifier();

    return data;
  }

  /**
   * 네이버 OAuth URL 생성 (서버 콜백 -> 앱 딥링크 리다이렉트 방식)
   * 네이버는 커스텀 URL 스킴을 콜백으로 허용하지 않으므로,
   * 서버가 콜백을 받아서 앱으로 리다이렉트합니다.
   */
  static async generateNaverAuthUrl(): Promise<{
    authUrl: string;
    state: string;
    appCallbackUrl: string;
  }> {
    // state 생성 (CSRF 방지용)
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const state = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // state 저장 (콜백에서 검증용)
    await setCodeVerifier(state);

    // 앱 콜백 URL 생성 (Expo Go: exp://..., Standalone: contractsecretary://...)
    const appCallbackUrl = Linking.createURL('auth/callback');

    // 콜백 URL은 서버 (네이버는 http/https만 허용)
    // 서버가 받은 후 앱으로 리다이렉트
    // app_callback 파라미터로 앱 콜백 URL 전달
    const serverCallbackUrl = `${API_CONFIG.baseUrl}/auth/naver/mobile-callback`;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: NAVER_CLIENT_ID,
      redirect_uri: serverCallbackUrl,
      state,
    });

    const authUrl = `${NAVER_AUTH_URL}?${params.toString()}`;

    console.log('[AuthService] Generated Naver auth URL:', authUrl);
    console.log('[AuthService] Server callback URL:', serverCallbackUrl);
    console.log('[AuthService] App callback URL:', appCallbackUrl);

    return { authUrl, state, appCallbackUrl };
  }

  /**
   * 토큰 저장
   */
  static async saveAuthTokens(
    accessToken: string,
    refreshToken: string,
    userId: string
  ): Promise<void> {
    await saveTokens({ accessToken, refreshToken, userId });
  }

  /**
   * 토큰 삭제
   */
  static async clearTokens(): Promise<void> {
    await clearAllTokens();
  }

  /**
   * 저장된 토큰 가져오기
   */
  static async getStoredTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    userId: string | null;
  }> {
    const [accessToken, refreshToken, userId] = await Promise.all([
      getAccessToken(),
      getRefreshToken(),
      getUserId(),
    ]);

    return { accessToken, refreshToken, userId };
  }

  /**
   * 토큰 갱신
   */
  static async refreshTokens(
    refreshToken: string
  ): Promise<TokenRefreshResponse> {
    return post<TokenRefreshResponse>(API_ENDPOINTS.auth.refresh, {
      refreshToken,
    });
  }

  /**
   * 로그아웃 (서버에 알림)
   */
  static async logout(refreshToken: string): Promise<void> {
    try {
      await post(API_ENDPOINTS.auth.logout, { refreshToken });
    } catch {
      // 서버 로그아웃 실패해도 무시 (로컬 토큰은 삭제됨)
    }
  }
}
