import { get, post, patch, del, API_ENDPOINTS } from '@/modules/common/api';
import type {
  Contract,
  CreateContractDto,
  UpdateContractDto,
  ContractQueryParams,
  PaginatedContracts,
  ExpiringContractsStats,
} from '../types';

/**
 * 계약 서비스
 * 서버 API와 통신하여 계약 데이터를 관리합니다.
 */
export class ContractsService {
  /**
   * 계약 목록 조회 (페이지네이션 포함)
   */
  static async getContracts(
    params?: ContractQueryParams
  ): Promise<PaginatedContracts> {
    const queryString = new URLSearchParams();

    if (params?.propertyId) queryString.append('propertyId', params.propertyId);
    if (params?.contractType)
      queryString.append('contractType', params.contractType);
    if (params?.status) queryString.append('status', params.status);
    if (params?.expiringInDays)
      queryString.append('expiringInDays', params.expiringInDays.toString());
    if (params?.search) queryString.append('search', params.search);
    if (params?.includeProperty !== undefined) {
      queryString.append('includeProperty', params.includeProperty.toString());
    }
    if (params?.sortBy) queryString.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder);
    if (params?.page) queryString.append('page', params.page.toString());
    if (params?.limit) queryString.append('limit', params.limit.toString());

    const query = queryString.toString();
    const endpoint = `${API_ENDPOINTS.contracts.list}${query ? `?${query}` : ''}`;
    return get<PaginatedContracts>(endpoint);
  }

  /**
   * 계약 상세 조회
   */
  static async getContractById(id: string): Promise<Contract> {
    return get<Contract>(`${API_ENDPOINTS.contracts.detail(id)}?includeProperty=true`);
  }

  /**
   * 계약 생성
   */
  static async createContract(data: CreateContractDto): Promise<Contract> {
    return post<Contract>(API_ENDPOINTS.contracts.create, data);
  }

  /**
   * 계약 수정
   */
  static async updateContract(
    id: string,
    data: UpdateContractDto
  ): Promise<Contract> {
    return patch<Contract>(API_ENDPOINTS.contracts.update(id), data);
  }

  /**
   * 계약 삭제
   */
  static async deleteContract(id: string): Promise<void> {
    return del<void>(API_ENDPOINTS.contracts.delete(id));
  }

  /**
   * 만료 임박 계약 통계 조회
   * 이번달 만료 건수, D-7, D-30, D-90 건수를 반환합니다.
   */
  static async getExpiringStats(): Promise<ExpiringContractsStats> {
    return get<ExpiringContractsStats>('/contracts/stats/expiring');
  }
}
