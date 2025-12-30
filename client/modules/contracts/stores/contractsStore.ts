import { create } from 'zustand';
import { ContractsService } from '../services/contracts.service';
import type {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ContractQueryParams,
  PaginationMeta,
  ExpiringContractsStats,
} from '../types';

// ========================================================
// Store State & Actions
// ========================================================

interface ContractsState {
  // 데이터
  contracts: Contract[];
  selectedContract: Contract | null;
  pagination: PaginationMeta | null;
  expiringStats: ExpiringContractsStats | null;

  // 로딩 상태
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingStats: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // 에러 상태
  error: string | null;

  // 필터/검색
  queryParams: ContractQueryParams;
}

interface ContractsActions {
  // 조회
  fetchContracts: (params?: ContractQueryParams) => Promise<void>;
  fetchMoreContracts: () => Promise<void>;
  fetchContractById: (id: string) => Promise<Contract | null>;
  fetchExpiringStats: () => Promise<void>;
  fetchExpiringContracts: (days: 7 | 30 | 90) => Promise<void>;
  refreshContracts: () => Promise<void>;

  // CRUD
  createContract: (data: CreateContractDto) => Promise<Contract | null>;
  updateContract: (id: string, data: UpdateContractDto) => Promise<Contract | null>;
  deleteContract: (id: string) => Promise<boolean>;

  // 상태 관리
  setSelectedContract: (contract: Contract | null) => void;
  setQueryParams: (params: ContractQueryParams) => void;
  clearError: () => void;
  reset: () => void;
}

type ContractsStore = ContractsState & ContractsActions;

// ========================================================
// Initial State
// ========================================================

const initialState: ContractsState = {
  contracts: [],
  selectedContract: null,
  pagination: null,
  expiringStats: null,
  isLoading: false,
  isLoadingMore: false,
  isLoadingStats: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  queryParams: {
    page: 1,
    limit: 20,
    includeProperty: true,
    status: 'ACTIVE',
    sortBy: 'expirationDate',
    sortOrder: 'asc',
  },
};

// ========================================================
// Store
// ========================================================

export const useContractsStore = create<ContractsStore>((set, get) => ({
  ...initialState,

  // -------------------------------------------------------
  // 조회 액션
  // -------------------------------------------------------

  fetchContracts: async (params?: ContractQueryParams) => {
    const queryParams = params ?? get().queryParams;

    set({ isLoading: true, error: null, queryParams });

    try {
      const result = await ContractsService.getContracts(queryParams);
      set({
        contracts: result.data,
        pagination: result.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '계약 목록 조회에 실패했습니다.';
      set({ error: message, isLoading: false });
    }
  },

  fetchMoreContracts: async () => {
    const { pagination, contracts, queryParams, isLoadingMore } = get();

    if (isLoadingMore || !pagination?.hasNextPage) {
      return;
    }

    set({ isLoadingMore: true, error: null });

    try {
      const nextParams = { ...queryParams, page: (queryParams.page ?? 1) + 1 };
      const result = await ContractsService.getContracts(nextParams);

      set({
        contracts: [...contracts, ...result.data],
        pagination: result.meta,
        queryParams: nextParams,
        isLoadingMore: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '추가 계약 조회에 실패했습니다.';
      set({ error: message, isLoadingMore: false });
    }
  },

  fetchContractById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const contract = await ContractsService.getContractById(id);
      set({ selectedContract: contract, isLoading: false });
      return contract;
    } catch (error) {
      const message = error instanceof Error ? error.message : '계약 상세 조회에 실패했습니다.';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  fetchExpiringStats: async () => {
    set({ isLoadingStats: true });

    try {
      const stats = await ContractsService.getExpiringStats();
      set({ expiringStats: stats, isLoadingStats: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '만료 임박 통계 조회에 실패했습니다.';
      set({ error: message, isLoadingStats: false });
    }
  },

  fetchExpiringContracts: async (days: 7 | 30 | 90) => {
    const params: ContractQueryParams = {
      ...get().queryParams,
      expiringInDays: days,
      status: 'ACTIVE',
      page: 1,
    };
    await get().fetchContracts(params);
  },

  refreshContracts: async () => {
    const { queryParams } = get();
    const refreshParams = { ...queryParams, page: 1 };
    await get().fetchContracts(refreshParams);
  },

  // -------------------------------------------------------
  // CRUD 액션
  // -------------------------------------------------------

  createContract: async (data: CreateContractDto) => {
    set({ isCreating: true, error: null });

    try {
      const newContract = await ContractsService.createContract(data);

      set((state) => ({
        contracts: [newContract, ...state.contracts],
        isCreating: false,
      }));

      // 통계 갱신
      get().fetchExpiringStats();

      return newContract;
    } catch (error) {
      const message = error instanceof Error ? error.message : '계약 등록에 실패했습니다.';
      set({ error: message, isCreating: false });
      return null;
    }
  },

  updateContract: async (id: string, data: UpdateContractDto) => {
    set({ isUpdating: true, error: null });

    try {
      const updatedContract = await ContractsService.updateContract(id, data);

      set((state) => ({
        contracts: state.contracts.map((c) => (c.id === id ? updatedContract : c)),
        selectedContract:
          state.selectedContract?.id === id ? updatedContract : state.selectedContract,
        isUpdating: false,
      }));

      // 통계 갱신 (만기일 변경 시)
      if (data.expirationDate || data.status) {
        get().fetchExpiringStats();
      }

      return updatedContract;
    } catch (error) {
      const message = error instanceof Error ? error.message : '계약 수정에 실패했습니다.';
      set({ error: message, isUpdating: false });
      return null;
    }
  },

  deleteContract: async (id: string) => {
    set({ isDeleting: true, error: null });

    try {
      await ContractsService.deleteContract(id);

      set((state) => ({
        contracts: state.contracts.filter((c) => c.id !== id),
        selectedContract: state.selectedContract?.id === id ? null : state.selectedContract,
        isDeleting: false,
      }));

      // 통계 갱신
      get().fetchExpiringStats();

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '계약 삭제에 실패했습니다.';
      set({ error: message, isDeleting: false });
      return false;
    }
  },

  // -------------------------------------------------------
  // 상태 관리 액션
  // -------------------------------------------------------

  setSelectedContract: (contract: Contract | null) => {
    set({ selectedContract: contract });
  },

  setQueryParams: (params: ContractQueryParams) => {
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// ========================================================
// Selectors (성능 최적화를 위한 셀렉터)
// ========================================================

export const selectContracts = (state: ContractsStore) => state.contracts;
export const selectSelectedContract = (state: ContractsStore) => state.selectedContract;
export const selectPagination = (state: ContractsStore) => state.pagination;
export const selectExpiringStats = (state: ContractsStore) => state.expiringStats;
export const selectContractsIsLoading = (state: ContractsStore) => state.isLoading;
export const selectError = (state: ContractsStore) => state.error;
export const selectQueryParams = (state: ContractsStore) => state.queryParams;

export const selectHasMore = (state: ContractsStore) => state.pagination?.hasNextPage ?? false;

export const selectContractById = (id: string) => (state: ContractsStore) =>
  state.contracts.find((c) => c.id === id) ?? null;

// D-Day 기반 필터
export const selectD7Contracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.dDayBadge === 'D-7');

export const selectD30Contracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.dDayBadge === 'D-30');

export const selectD90Contracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.dDayBadge === 'D-90');

export const selectExpiredContracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.dDayBadge === 'EXPIRED');

// 계약 유형별 필터
export const selectJeonseContracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.contractType === 'JEONSE');

export const selectWolseContracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.contractType === 'WOLSE');

export const selectMaemaeContracts = (state: ContractsStore) =>
  state.contracts.filter((c) => c.contractType === 'MAEMAE');
