import { create } from 'zustand';
import { PropertiesService } from '../services/properties.service';
import type {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyQueryParams,
  PaginationMeta,
} from '../types';

// ========================================================
// Store State & Actions
// ========================================================

interface PropertiesState {
  // 데이터
  properties: Property[];
  selectedProperty: Property | null;
  pagination: PaginationMeta | null;

  // 로딩 상태
  isLoading: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // 에러 상태
  error: string | null;

  // 필터/검색
  queryParams: PropertyQueryParams;
}

interface PropertiesActions {
  // 조회
  fetchProperties: (params?: PropertyQueryParams) => Promise<void>;
  fetchMoreProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<Property | null>;
  refreshProperties: () => Promise<void>;

  // CRUD
  createProperty: (data: CreatePropertyDto) => Promise<Property | null>;
  updateProperty: (id: string, data: UpdatePropertyDto) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;

  // 상태 관리
  setSelectedProperty: (property: Property | null) => void;
  setQueryParams: (params: PropertyQueryParams) => void;
  clearError: () => void;
  reset: () => void;
}

type PropertiesStore = PropertiesState & PropertiesActions;

// ========================================================
// Initial State
// ========================================================

const initialState: PropertiesState = {
  properties: [],
  selectedProperty: null,
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  queryParams: {
    page: 1,
    limit: 20,
    includeContracts: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// ========================================================
// Store
// ========================================================

export const usePropertiesStore = create<PropertiesStore>((set, get) => ({
  ...initialState,

  // -------------------------------------------------------
  // 조회 액션
  // -------------------------------------------------------

  fetchProperties: async (params?: PropertyQueryParams) => {
    const queryParams = params ?? get().queryParams;

    set({ isLoading: true, error: null, queryParams });

    try {
      const result = await PropertiesService.getProperties(queryParams);
      set({
        properties: result.data,
        pagination: result.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '매물 목록 조회에 실패했습니다.';
      set({ error: message, isLoading: false });
    }
  },

  fetchMoreProperties: async () => {
    const { pagination, properties, queryParams, isLoadingMore } = get();

    if (isLoadingMore || !pagination?.hasNextPage) {
      return;
    }

    set({ isLoadingMore: true, error: null });

    try {
      const nextParams = { ...queryParams, page: (queryParams.page ?? 1) + 1 };
      const result = await PropertiesService.getProperties(nextParams);

      set({
        properties: [...properties, ...result.data],
        pagination: result.meta,
        queryParams: nextParams,
        isLoadingMore: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '추가 매물 조회에 실패했습니다.';
      set({ error: message, isLoadingMore: false });
    }
  },

  fetchPropertyById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const property = await PropertiesService.getPropertyById(id);
      set({ selectedProperty: property, isLoading: false });
      return property;
    } catch (error) {
      const message = error instanceof Error ? error.message : '매물 상세 조회에 실패했습니다.';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  refreshProperties: async () => {
    const { queryParams } = get();
    const refreshParams = { ...queryParams, page: 1 };
    await get().fetchProperties(refreshParams);
  },

  // -------------------------------------------------------
  // CRUD 액션
  // -------------------------------------------------------

  createProperty: async (data: CreatePropertyDto) => {
    set({ isCreating: true, error: null });

    try {
      const newProperty = await PropertiesService.createProperty(data);

      set((state) => ({
        properties: [newProperty, ...state.properties],
        isCreating: false,
      }));

      return newProperty;
    } catch (error) {
      const message = error instanceof Error ? error.message : '매물 등록에 실패했습니다.';
      set({ error: message, isCreating: false });
      return null;
    }
  },

  updateProperty: async (id: string, data: UpdatePropertyDto) => {
    set({ isUpdating: true, error: null });

    try {
      const updatedProperty = await PropertiesService.updateProperty(id, data);

      set((state) => ({
        properties: state.properties.map((p) => (p.id === id ? updatedProperty : p)),
        selectedProperty:
          state.selectedProperty?.id === id ? updatedProperty : state.selectedProperty,
        isUpdating: false,
      }));

      return updatedProperty;
    } catch (error) {
      const message = error instanceof Error ? error.message : '매물 수정에 실패했습니다.';
      set({ error: message, isUpdating: false });
      return null;
    }
  },

  deleteProperty: async (id: string) => {
    set({ isDeleting: true, error: null });

    try {
      await PropertiesService.deleteProperty(id);

      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        selectedProperty: state.selectedProperty?.id === id ? null : state.selectedProperty,
        isDeleting: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '매물 삭제에 실패했습니다.';
      set({ error: message, isDeleting: false });
      return false;
    }
  },

  // -------------------------------------------------------
  // 상태 관리 액션
  // -------------------------------------------------------

  setSelectedProperty: (property: Property | null) => {
    set({ selectedProperty: property });
  },

  setQueryParams: (params: PropertyQueryParams) => {
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

export const selectProperties = (state: PropertiesStore) => state.properties;
export const selectSelectedProperty = (state: PropertiesStore) => state.selectedProperty;
export const selectPagination = (state: PropertiesStore) => state.pagination;
export const selectPropertiesIsLoading = (state: PropertiesStore) => state.isLoading;
export const selectError = (state: PropertiesStore) => state.error;
export const selectQueryParams = (state: PropertiesStore) => state.queryParams;

export const selectHasMore = (state: PropertiesStore) => state.pagination?.hasNextPage ?? false;

export const selectPropertyById = (id: string) => (state: PropertiesStore) =>
  state.properties.find((p) => p.id === id) ?? null;
