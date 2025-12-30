import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ========================================================
// Environment Detection
// ========================================================

const API_PORT = 3000;

function getDebuggerHost(): string | null {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return null;
}

function getDefaultApiUrl(): string {
  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  }

  const hostIp = getDebuggerHost();
  if (hostIp) {
    return `http://${hostIp}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

function getApiUrl(): string {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl as
    | string
    | undefined;

  const isValidUrl =
    configuredUrl &&
    typeof configuredUrl === 'string' &&
    configuredUrl.startsWith('http') &&
    !configuredUrl.includes('${');

  const url = isValidUrl ? configuredUrl : getDefaultApiUrl();

  if (__DEV__) {
    console.log('[API Config] Platform:', Platform.OS);
    console.log('[API Config] Host IP:', getDebuggerHost());
    console.log('[API Config] Configured URL:', configuredUrl);
    console.log('[API Config] Using URL:', url);
  }

  return url;
}

export const API_CONFIG = {
  baseUrl: getApiUrl(),
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    token: '/auth/token',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    redirectNaver: '/auth/naver',
    callbackNaver: '/auth/naver/callback',
    naverToken: '/auth/naver/token', // 모바일 앱용 네이버 로그인
  },
  properties: {
    list: '/properties',
    create: '/properties',
    detail: (id: string) => `/properties/${id}`,
    update: (id: string) => `/properties/${id}`,
    delete: (id: string) => `/properties/${id}`,
  },
  contracts: {
    list: '/contracts',
    create: '/contracts',
    detail: (id: string) => `/contracts/${id}`,
    update: (id: string) => `/contracts/${id}`,
    delete: (id: string) => `/contracts/${id}`,
  },

  health: '/health',
} as const;

export const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.auth.signup,
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.token,
  API_ENDPOINTS.auth.refresh,
  API_ENDPOINTS.auth.logout,
  API_ENDPOINTS.auth.redirectNaver,
  API_ENDPOINTS.auth.callbackNaver,
  API_ENDPOINTS.auth.naverToken,
  API_ENDPOINTS.health,
] as const;
