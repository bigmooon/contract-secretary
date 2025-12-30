/**
 * 사용자 관련 타입 정의
 * 서버 Prisma 스키마와 동기화됨
 */

// ========================================================
// Enums (서버 Prisma schema와 동일)
// ========================================================

export type Provider = 'LOCAL' | 'NAVER';

// ========================================================
// 사용자 (User)
// ========================================================

export interface User {
  id: string;
  email: string | null;
  name: string;
  provider: Provider;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  pushToken?: string;
}

// ========================================================
// 알림 설정
// ========================================================

export interface NotificationSettings {
  enabled: boolean;
  alertTime: string; // HH:mm 형식 (예: "09:00")
}

export interface UpdateNotificationSettingsDto {
  enabled?: boolean;
  alertTime?: string;
}
