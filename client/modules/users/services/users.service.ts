import { get, patch } from '@/modules/common/api';
import type { User, UpdateUserDto } from '../types';

const USERS_ENDPOINTS = {
  me: '/users/me',
} as const;

/**
 * 사용자 서비스
 */
export class UsersService {
  /**
   * 현재 사용자 정보 조회
   */
  static async getCurrentUser(): Promise<User> {
    return get<User>(USERS_ENDPOINTS.me);
  }

  /**
   * 사용자 정보 수정
   */
  static async updateUser(data: UpdateUserDto): Promise<User> {
    return patch<User>(USERS_ENDPOINTS.me, data);
  }
}
