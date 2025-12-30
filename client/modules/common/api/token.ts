import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Platform-aware storage abstraction
// Uses SecureStore on native (iOS/Android) and localStorage on web
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER: 'user',
  CODE_VERIFIER: 'code_verifier',
} as const;

// ========================================================
// Access Token
// ========================================================
export async function getAccessToken(): Promise<string | null> {
  try {
    return await storage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('[Token] Failed to get access token: ', error);
    return null;
  }
}

export async function setAccessToken(accessToken: string): Promise<boolean> {
  try {
    await storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    return true;
  } catch (error) {
    console.error('[Token] Failed to set access token: ', error);
    return false;
  }
}

export async function removeAccessToken(): Promise<boolean> {
  try {
    await storage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    return true;
  } catch (error) {
    console.error('[Token] Failed to remove access token: ', error);
    return false;
  }
}

// ========================================================
// Refresh Token
// ========================================================
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await storage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('[Token] Failed to get refresh token: ', error);
    return null;
  }
}

export async function setRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    await storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    return true;
  } catch (error) {
    console.error('[Token] Failed to set refresh token: ', error);
    return false;
  }
}

export async function removeRefreshToken(): Promise<boolean> {
  try {
    await storage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    return true;
  } catch (error) {
    console.error('[Token] Failed to remove refresh token: ', error);
    return false;
  }
}

// ========================================================
// User ID
// ========================================================
export async function getUserId(): Promise<string | null> {
  try {
    return await storage.getItem(TOKEN_KEYS.USER_ID);
  } catch (error) {
    console.error('[Token] Failed to get user id: ', error);
    return null;
  }
}

export async function setUserId(userId: string): Promise<boolean> {
  try {
    await storage.setItem(TOKEN_KEYS.USER_ID, userId);
    return true;
  } catch (error) {
    console.error('[Token] Failed to set user id: ', error);
    return false;
  }
}

export async function removeUserId(): Promise<boolean> {
  try {
    await storage.removeItem(TOKEN_KEYS.USER_ID);
    return true;
  } catch (error) {
    console.error('[Token] Failed to remove user id: ', error);
    return false;
  }
}

// ========================================================
// User
// ========================================================
export async function getUser(): Promise<string | null> {
  try {
    return await storage.getItem(TOKEN_KEYS.USER);
  } catch (error) {
    console.error('[Token] Failed to get user: ', error);
    return null;
  }
}

export async function setUser(user: string): Promise<boolean> {
  try {
    await storage.setItem(TOKEN_KEYS.USER, user);
    return true;
  } catch (error) {
    console.error('[Token] Failed to set user: ', error);
    return false;
  }
}

export async function removeUser(): Promise<boolean> {
  try {
    await storage.removeItem(TOKEN_KEYS.USER);
    return true;
  } catch (error) {
    console.error('[Token] Failed to remove user: ', error);
    return false;
  }
}

// ========================================================
// Code Verifier
// ========================================================
export async function getCodeVerifier(): Promise<string | null> {
  try {
    return await storage.getItem(TOKEN_KEYS.CODE_VERIFIER);
  } catch (error) {
    console.error('[Token] Failed to get code verifier: ', error);
    return null;
  }
}

export async function setCodeVerifier(codeVerifier: string): Promise<boolean> {
  try {
    await storage.setItem(TOKEN_KEYS.CODE_VERIFIER, codeVerifier);
    return true;
  } catch (error) {
    console.error('[Token] Failed to set code verifier: ', error);
    return false;
  }
}

export async function removeCodeVerifier(): Promise<boolean> {
  try {
    await storage.removeItem(TOKEN_KEYS.CODE_VERIFIER);
    return true;
  } catch (error) {
    console.error('[Token] Failed to remove code verifier: ', error);
    return false;
  }
}

// ========================================================
// Batch Operations
// ========================================================
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
}

export async function saveTokens(data: TokenData): Promise<boolean> {
  try {
    const promises: Promise<void>[] = [
      storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.accessToken),
    ];

    if (data.refreshToken) {
      promises.push(
        storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, data.refreshToken)
      );
    }

    if (data.userId) {
      promises.push(storage.setItem(TOKEN_KEYS.USER_ID, data.userId));
    }

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('[Token] Failed to save tokens: ', error);
    return false;
  }
}

export async function clearAllTokens(): Promise<boolean> {
  try {
    await Promise.all([
      storage.removeItem(TOKEN_KEYS.ACCESS_TOKEN),
      storage.removeItem(TOKEN_KEYS.REFRESH_TOKEN),
      storage.removeItem(TOKEN_KEYS.USER_ID),
      storage.removeItem(TOKEN_KEYS.USER),
      storage.removeItem(TOKEN_KEYS.CODE_VERIFIER),
    ]);
    return true;
  } catch (error) {
    console.error('[Token] Failed to clear all tokens: ', error);
    return false;
  }
}

export async function hasValidToken(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
