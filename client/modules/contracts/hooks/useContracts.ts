import { useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { useContractsStore } from '../stores/contractsStore';
import type { ContractQueryParams } from '../types';

/**
 * 계약 목록 조회 훅 (Zustand 스토어 연동)
 * 컴포넌트 마운트 시 자동으로 계약 목록을 조회합니다.
 */
export function useContracts(params?: ContractQueryParams) {
  const {
    contracts,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fetchContracts,
    fetchMoreContracts,
    refreshContracts,
    setQueryParams,
  } = useContractsStore(
    useShallow((state) => ({
      contracts: state.contracts,
      pagination: state.pagination,
      isLoading: state.isLoading,
      isLoadingMore: state.isLoadingMore,
      error: state.error,
      fetchContracts: state.fetchContracts,
      fetchMoreContracts: state.fetchMoreContracts,
      refreshContracts: state.refreshContracts,
      setQueryParams: state.setQueryParams,
    }))
  );

  useEffect(() => {
    if (params) {
      setQueryParams(params);
    }
    fetchContracts(params);
  }, []);

  return {
    contracts,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fetchContracts,
    fetchMoreContracts,
    refreshContracts,
    refetch: refreshContracts,
  };
}

/**
 * 계약 상세 조회 훅 (Zustand 스토어 연동)
 * id가 변경되면 자동으로 계약 상세 정보를 조회합니다.
 */
export function useContract(id: string | null) {
  const { selectedContract, isLoading, error, fetchContractById, setSelectedContract } =
    useContractsStore(
      useShallow((state) => ({
        selectedContract: state.selectedContract,
        isLoading: state.isLoading,
        error: state.error,
        fetchContractById: state.fetchContractById,
        setSelectedContract: state.setSelectedContract,
      }))
    );

  const fetchContract = useCallback(() => {
    if (id) {
      fetchContractById(id);
    }
  }, [id, fetchContractById]);

  useEffect(() => {
    if (id) {
      fetchContractById(id);
    } else {
      setSelectedContract(null);
    }
  }, [id, fetchContractById, setSelectedContract]);

  return {
    contract: selectedContract,
    isLoading,
    error,
    fetchContract,
    refetch: fetchContract,
  };
}

/**
 * 만료 임박 계약 통계 조회 훅 (Zustand 스토어 연동)
 * 홈화면에서 이번달 만료 건수, D-7/D-30/D-90 건수를 표시할 때 사용합니다.
 */
export function useExpiringStats() {
  const { expiringStats, isLoadingStats, error, fetchExpiringStats } = useContractsStore(
    useShallow((state) => ({
      expiringStats: state.expiringStats,
      isLoadingStats: state.isLoadingStats,
      error: state.error,
      fetchExpiringStats: state.fetchExpiringStats,
    }))
  );

  useEffect(() => {
    fetchExpiringStats();
  }, [fetchExpiringStats]);

  return {
    stats: expiringStats,
    isLoading: isLoadingStats,
    error,
    refetch: fetchExpiringStats,
  };
}

/**
 * 만료 임박 계약 목록 조회 훅 (Zustand 스토어 연동)
 * D-7, D-30, D-90 필터별로 계약 목록을 조회합니다.
 */
export function useExpiringContracts(days: 7 | 30 | 90) {
  const { contracts, isLoading, error, fetchExpiringContracts } = useContractsStore(
    useShallow((state) => ({
      contracts: state.contracts,
      isLoading: state.isLoading,
      error: state.error,
      fetchExpiringContracts: state.fetchExpiringContracts,
    }))
  );

  useEffect(() => {
    fetchExpiringContracts(days);
  }, [days, fetchExpiringContracts]);

  return {
    contracts,
    isLoading,
    error,
    refetch: () => fetchExpiringContracts(days),
  };
}

/**
 * 계약 생성 훅 (Zustand 스토어 연동)
 */
export function useCreateContract() {
  const { isCreating, error, createContract, clearError } = useContractsStore(
    useShallow((state) => ({
      isCreating: state.isCreating,
      error: state.error,
      createContract: state.createContract,
      clearError: state.clearError,
    }))
  );

  return {
    createContract,
    isLoading: isCreating,
    error,
    clearError,
  };
}

/**
 * 계약 수정 훅 (Zustand 스토어 연동)
 */
export function useUpdateContract() {
  const { isUpdating, error, updateContract, clearError } = useContractsStore(
    useShallow((state) => ({
      isUpdating: state.isUpdating,
      error: state.error,
      updateContract: state.updateContract,
      clearError: state.clearError,
    }))
  );

  return {
    updateContract,
    isLoading: isUpdating,
    error,
    clearError,
  };
}

/**
 * 계약 삭제 훅 (Zustand 스토어 연동)
 */
export function useDeleteContract() {
  const { isDeleting, error, deleteContract, clearError } = useContractsStore(
    useShallow((state) => ({
      isDeleting: state.isDeleting,
      error: state.error,
      deleteContract: state.deleteContract,
      clearError: state.clearError,
    }))
  );

  return {
    deleteContract,
    isLoading: isDeleting,
    error,
    clearError,
  };
}
