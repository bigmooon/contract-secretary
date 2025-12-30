import { useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { usePropertiesStore } from '../stores/propertiesStore';
import type { PropertyQueryParams } from '../types';

/**
 * 매물 목록 조회 훅 (Zustand 스토어 연동)
 * 컴포넌트 마운트 시 자동으로 매물 목록을 조회합니다.
 */
export function useProperties(params?: PropertyQueryParams) {
  const {
    properties,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fetchProperties,
    fetchMoreProperties,
    refreshProperties,
    setQueryParams,
  } = usePropertiesStore(
    useShallow((state) => ({
      properties: state.properties,
      pagination: state.pagination,
      isLoading: state.isLoading,
      isLoadingMore: state.isLoadingMore,
      error: state.error,
      fetchProperties: state.fetchProperties,
      fetchMoreProperties: state.fetchMoreProperties,
      refreshProperties: state.refreshProperties,
      setQueryParams: state.setQueryParams,
    }))
  );

  useEffect(() => {
    if (params) {
      setQueryParams(params);
    }
    fetchProperties(params);
  }, []);

  return {
    properties,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fetchProperties,
    fetchMoreProperties,
    refreshProperties,
    refetch: refreshProperties,
  };
}

/**
 * 매물 상세 조회 훅 (Zustand 스토어 연동)
 * id가 변경되면 자동으로 매물 상세 정보를 조회합니다.
 */
export function useProperty(id: string | null) {
  const { selectedProperty, isLoading, error, fetchPropertyById, setSelectedProperty } =
    usePropertiesStore(
      useShallow((state) => ({
        selectedProperty: state.selectedProperty,
        isLoading: state.isLoading,
        error: state.error,
        fetchPropertyById: state.fetchPropertyById,
        setSelectedProperty: state.setSelectedProperty,
      }))
    );

  const fetchProperty = useCallback(() => {
    if (id) {
      fetchPropertyById(id);
    }
  }, [id, fetchPropertyById]);

  useEffect(() => {
    if (id) {
      fetchPropertyById(id);
    } else {
      setSelectedProperty(null);
    }
  }, [id, fetchPropertyById, setSelectedProperty]);

  return {
    property: selectedProperty,
    isLoading,
    error,
    fetchProperty,
    refetch: fetchProperty,
  };
}

/**
 * 매물 생성 훅 (Zustand 스토어 연동)
 */
export function useCreateProperty() {
  const { isCreating, error, createProperty, clearError } = usePropertiesStore(
    useShallow((state) => ({
      isCreating: state.isCreating,
      error: state.error,
      createProperty: state.createProperty,
      clearError: state.clearError,
    }))
  );

  return {
    createProperty,
    isLoading: isCreating,
    error,
    clearError,
  };
}

/**
 * 매물 수정 훅 (Zustand 스토어 연동)
 */
export function useUpdateProperty() {
  const { isUpdating, error, updateProperty, clearError } = usePropertiesStore(
    useShallow((state) => ({
      isUpdating: state.isUpdating,
      error: state.error,
      updateProperty: state.updateProperty,
      clearError: state.clearError,
    }))
  );

  return {
    updateProperty,
    isLoading: isUpdating,
    error,
    clearError,
  };
}

/**
 * 매물 삭제 훅 (Zustand 스토어 연동)
 */
export function useDeleteProperty() {
  const { isDeleting, error, deleteProperty, clearError } = usePropertiesStore(
    useShallow((state) => ({
      isDeleting: state.isDeleting,
      error: state.error,
      deleteProperty: state.deleteProperty,
      clearError: state.clearError,
    }))
  );

  return {
    deleteProperty,
    isLoading: isDeleting,
    error,
    clearError,
  };
}
