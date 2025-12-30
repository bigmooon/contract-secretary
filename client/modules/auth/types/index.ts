/**
 * 인증 관련 타입 정의
 * 서버 Prisma 스키마와 동기화됨
 */

import type { Provider } from '../../users/types';

// ========================================================
// 인증 사용자
// ========================================================

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  provider: Provider;
}

// ========================================================
// 토큰
// ========================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ========================================================
// 인증 상태
// ========================================================

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

// ========================================================
// 로그인/회원가입 DTO
// ========================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

// ========================================================
// 네이버 인증
// ========================================================

export interface NaverAuthState {
  code: string;
  codeVerifier: string;
}

// ========================================================
// 훅 반환 타입
// ========================================================

export interface UseNaverAuthReturn extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}
