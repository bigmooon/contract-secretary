import axios, {
  AxiosRequestConfig,
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  API_CONFIG,
  API_ENDPOINTS,
  PUBLIC_ENDPOINTS,
} from './config/api.config';
import {
  clearAllTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './token';
import type { ApiError, RefreshTokenResponse } from './types/api.type';

const baseApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================================
// Token Refresh State
// ========================================================

let isRefreshing = false;
let failedRequestsQueue: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

function processQueue(error: Error | null, token: string | null = null): void {
  failedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedRequestsQueue = [];
}

// ========================================================
// Request Interceptor
// ========================================================

baseApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // skip token injection for public routes
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublic) {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Error] Request error: ', error);
    return Promise.reject(error);
  }
);

// ========================================================
// Response Interceptor
// ========================================================

baseApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        PUBLIC_ENDPOINTS.some((endpoint) =>
          originalRequest.url?.includes(endpoint)
        )
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return baseApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error('[Token] Refresh token not found');
        }

        const response = await axios.post<RefreshTokenResponse>(
          `${API_CONFIG.baseUrl}${API_ENDPOINTS.auth.refresh}`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await saveTokens({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return baseApi(originalRequest);
      } catch (refresherror) {
        // refresh failed - clear tokens and redirect to login
        processQueue(refresherror as Error);
        await clearAllTokens();

        onUnauthorized();

        return Promise.reject(refresherror);
      } finally {
        isRefreshing = false;
      }
    }

    if (__DEV__) {
      console.error('[API Error] Response error: ', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: originalRequest?.url,
      });
    }

    return Promise.reject(error);
  }
);

// ========================================================
// Unauthorized Handler
// ========================================================

type UnauthorizedCallback = () => void;
let unauthorizedCallback: UnauthorizedCallback | null = null;

function onUnauthorized(): void {
  if (unauthorizedCallback) {
    unauthorizedCallback();
  }
}

// ========================================================
// Helper Functions
// ========================================================

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await baseApi.request<T>(config);
  return response.data;
}

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseApi.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseApi.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseApi.put<T>(url, data, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseApi.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await baseApi.delete<T>(url, config);
  return response.data;
}

export default baseApi;
