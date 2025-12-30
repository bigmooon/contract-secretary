/**
 * 계약 관련 타입 정의
 * 서버 Prisma 스키마와 동기화됨
 */

// ========================================================
// Enums (서버 Prisma schema와 동일)
// ========================================================

export type ContractType = 'JEONSE' | 'WOLSE' | 'MAEMAE';

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'RENEWED' | 'TERMINATED';

export type StakeholderRole = 'OWNER' | 'TENANT';

export type DDayBadge = 'D-7' | 'D-30' | 'D-90' | 'EXPIRED' | null;

// ========================================================
// 이해관계자 (Stakeholder)
// ========================================================

export interface Stakeholder {
  id: string;
  role: StakeholderRole;
  name: string | null;
  phone: string;
}

export interface CreateStakeholderDto {
  role: StakeholderRole;
  name?: string;
  phone: string;
}

// ========================================================
// 매물 요약 (계약 조회 시 포함)
// ========================================================

export interface PropertySummary {
  id: string;
  complexName: string;
  buildingName: string;
  unitNo: string;
  typeInfo: string | null;
}

// ========================================================
// 계약 (Contract)
// ========================================================

export interface Contract {
  id: string;
  propertyId: string;
  contractType: ContractType;
  depositPrice: string;
  monthlyRent: string;
  contractDate: string | null;
  expirationDate: string | null;
  status: ContractStatus;
  memo: string | null;
  dDay: number | null;
  dDayBadge: DDayBadge;
  createdAt: string;
  updatedAt: string;
  property?: PropertySummary;
  stakeholders: Stakeholder[];
}

export interface CreateContractDto {
  propertyId: string;
  contractType: ContractType;
  depositPrice: number;
  monthlyRent?: number;
  contractDate?: string;
  expirationDate?: string;
  status?: ContractStatus;
  memo?: string;
  stakeholders?: CreateStakeholderDto[];
}

export interface UpdateContractDto {
  contractType?: ContractType;
  depositPrice?: number;
  monthlyRent?: number;
  contractDate?: string;
  expirationDate?: string;
  status?: ContractStatus;
  memo?: string;
  stakeholders?: CreateStakeholderDto[];
}

// ========================================================
// 조회 파라미터
// ========================================================

export interface ContractQueryParams {
  propertyId?: string;
  contractType?: ContractType;
  status?: ContractStatus;
  expiringInDays?: number;
  search?: string;
  includeProperty?: boolean;
  sortBy?: 'createdAt' | 'expirationDate' | 'contractDate';
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

export interface PaginatedContracts {
  data: Contract[];
  meta: PaginationMeta;
}

// ========================================================
// 만료 임박 계약 통계 (홈화면용)
// ========================================================

export interface ExpiringContractsStats {
  thisMonth: number;
  d7: number;
  d30: number;
  d90: number;
}
