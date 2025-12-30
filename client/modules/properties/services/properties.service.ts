import { get, post, patch, del, API_ENDPOINTS } from '@/modules/common/api';
import type {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyQueryParams,
  PaginatedProperties,
} from '../types';

/**
 * 매물 서비스
 * 서버 API와 통신하여 매물 데이터를 관리합니다.
 */
export class PropertiesService {
  /**
   * 매물 목록 조회 (페이지네이션 포함)
   */
  static async getProperties(
    params?: PropertyQueryParams
  ): Promise<PaginatedProperties> {
    const queryString = new URLSearchParams();

    if (params?.contractType)
      queryString.append('contractType', params.contractType);
    if (params?.status) queryString.append('status', params.status);
    if (params?.complexName)
      queryString.append('complexName', params.complexName);
    if (params?.search) queryString.append('search', params.search);
    if (params?.includeContracts !== undefined) {
      queryString.append('includeContracts', params.includeContracts.toString());
    }
    if (params?.sortBy) queryString.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder);
    if (params?.page) queryString.append('page', params.page.toString());
    if (params?.limit) queryString.append('limit', params.limit.toString());

    const query = queryString.toString();
    const endpoint = `${API_ENDPOINTS.properties.list}${query ? `?${query}` : ''}`;
    return get<PaginatedProperties>(endpoint);
  }

  /**
   * 매물 상세 조회
   */
  static async getPropertyById(id: string): Promise<Property> {
    return get<Property>(
      `${API_ENDPOINTS.properties.detail(id)}?includeContracts=true`
    );
  }

  /**
   * 매물 생성
   */
  static async createProperty(data: CreatePropertyDto): Promise<Property> {
    return post<Property>(API_ENDPOINTS.properties.create, data);
  }

  /**
   * 매물 수정
   */
  static async updateProperty(
    id: string,
    data: UpdatePropertyDto
  ): Promise<Property> {
    return patch<Property>(API_ENDPOINTS.properties.update(id), data);
  }

  /**
   * 매물 삭제
   */
  static async deleteProperty(id: string): Promise<void> {
    return del<void>(API_ENDPOINTS.properties.delete(id));
  }
}
