import { useState, useCallback } from 'react';
import { UsersService } from '../services/users.service';
import type { User, UpdateUserDto } from '../types';

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await UsersService.getCurrentUser();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    fetchUser,
    refetch: fetchUser,
  };
}

/**
 * 사용자 정보 수정 훅
 */
export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (data: UpdateUserDto): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await UsersService.updateUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 정보 수정에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateUser,
    isLoading,
    error,
  };
}

