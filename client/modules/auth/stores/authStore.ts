import { create } from 'zustand';
import {
  clearAllTokens,
  getAccessToken as getStoredAccessToken,
  getRefreshToken as getStoredRefreshToken,
  getUser as getStoredUser,
  saveTokens,
  setAccessToken as storeAccessToken,
  setRefreshToken as storeRefreshToken,
  setUser as storeUser,
} from '@/modules/common/api';
import type { AuthTokens, AuthUser } from '../types';

// ========================================================
// Store State & Actions
// ========================================================

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  // 인증
  setAuth: (user: AuthUser, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;

  // 토큰
  setTokens: (tokens: AuthTokens) => Promise<void>;
  getAccessToken: () => string | null;

  // 상태 관리
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ========================================================
// Initial State
// ========================================================

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// ========================================================
// Store
// ========================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  // -------------------------------------------------------
  // 인증 액션
  // -------------------------------------------------------

  setAuth: async (user: AuthUser, tokens: AuthTokens) => {
    try {
      await saveTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      await storeUser(JSON.stringify(user));

      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증 정보 저장에 실패했습니다.';
      set({ error: message, isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      await clearAllTokens();

      set({
        ...initialState,
        isInitialized: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '로그아웃에 실패했습니다.';
      set({ error: message, isLoading: false });
    }
  },

  loadAuth: async () => {
    try {
      set({ isLoading: true });

      const [accessToken, refreshToken, userJson] = await Promise.all([
        getStoredAccessToken(),
        getStoredRefreshToken(),
        getStoredUser(),
      ]);

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson) as AuthUser;
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        set({
          ...initialState,
          isInitialized: true,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증 정보 불러오기에 실패했습니다.';
      set({
        ...initialState,
        isInitialized: true,
        error: message,
      });
    }
  },

  // -------------------------------------------------------
  // 토큰 액션
  // -------------------------------------------------------

  setTokens: async (tokens: AuthTokens) => {
    try {
      await storeAccessToken(tokens.accessToken);
      await storeRefreshToken(tokens.refreshToken);

      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '토큰 저장에 실패했습니다.';
      set({ error: message });
    }
  },

  getAccessToken: () => {
    return get().accessToken;
  },

  // -------------------------------------------------------
  // 상태 관리 액션
  // -------------------------------------------------------

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ========================================================
// Selectors
// ========================================================

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) =>
  state.isAuthenticated;
export const selectAuthIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsInitialized = (state: AuthStore) => state.isInitialized;
export const selectError = (state: AuthStore) => state.error;
export const selectAccessToken = (state: AuthStore) => state.accessToken;
