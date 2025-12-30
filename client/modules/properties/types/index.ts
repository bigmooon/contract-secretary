/**
 * 매물 관련 타입 정의
 * 서버 Prisma 스키마와 동기화됨
 */

// ========================================================
// Enums (서버 Prisma schema와 동일)
// ========================================================

export type ContractType = 'JEONSE' | 'WOLSE' | 'MAEMAE';

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'RENEWED' | 'TERMINATED';

export type DDayBadge = 'D-7' | 'D-30' | 'D-90' | 'EXPIRED' | null;

// ========================================================
// 계약 요약 (매물 조회 시 포함)
// ========================================================

export interface ContractSummary {
  id: string;
  contractType: ContractType;
  status: ContractStatus;
  expirationDate: string | null;
  dDay: number | null;
  dDayBadge: DDayBadge;
}

// ========================================================
// 매물 (Property)
// ========================================================

export interface Property {
  id: string;
  complexName: string;
  buildingName: string;
  unitNo: string;
  typeInfo: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  contracts?: ContractSummary[];
}

export interface CreatePropertyDto {
  complexName: string;
  buildingName: string;
  unitNo: string;
  typeInfo?: string;
  note?: string;
}

export interface UpdatePropertyDto {
  complexName?: string;
  buildingName?: string;
  unitNo?: string;
  typeInfo?: string;
  note?: string;
}

// ========================================================
// 조회 파라미터
// ========================================================

export interface PropertyQueryParams {
  contractType?: ContractType;
  status?: ContractStatus;
  complexName?: string;
  search?: string;
  includeContracts?: boolean;
  sortBy?: 'createdAt' | 'expirationDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ========================================================
// 페이지네이션
// ========================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProperties {
  data: Property[];
  meta: PaginationMeta;
}
