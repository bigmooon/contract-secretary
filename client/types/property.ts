/**
 * Property types and interfaces
 * Defines data structures for property management
 */

export type PropertyType = 'jeonse' | 'wolse' | 'sale';

export interface Contact {
  name?: string;
  phone: string;
}

export interface Property {
  id: string;
  /** 매물 타입 (전세/월세/매매) */
  type: PropertyType;
  /** 아파트/건물명 */
  buildingName: string;
  /** 동 */
  dong: string;
  /** 호수 */
  hosu: string;
  /** 타입/평수 (optional) */
  sizeType?: string;
  /** 보증금/매매가 */
  deposit: number;
  /** 월세 (월세일 경우만) */
  monthlyRent?: number;
  /** 계약일 */
  contractDate?: string;
  /** 만기일 */
  expirationDate?: string;
  /** 갱신 여부 */
  isRenewal?: boolean;
  /** 주인 연락처 (1인 이상) */
  ownerContacts: Contact[];
  /** 세입자 연락처 (optional, 1인 이상) */
  tenantContacts?: Contact[];
  /** 특이사항/비고 */
  notes?: string;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * Helper function to calculate days remaining until expiration
 */
export function calculateDaysRemaining(expirationDate?: string): number | null {
  if (!expirationDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiration = new Date(expirationDate);
  expiration.setHours(0, 0, 0, 0);

  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format price in Korean currency style
 */
export function formatPrice(price: number): string {
  if (price >= 100000000) {
    const uk = Math.floor(price / 100000000);
    const remainder = price % 100000000;
    if (remainder >= 10000) {
      const man = Math.floor(remainder / 10000);
      return `${uk}억 ${man.toLocaleString()}만원`;
    }
    return `${uk}억원`;
  }
  if (price >= 10000) {
    const man = Math.floor(price / 10000);
    return `${man.toLocaleString()}만원`;
  }
  return `${price.toLocaleString()}원`;
}

/**
 * Format date to Korean style (YYYY.MM.DD)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Get property type label in Korean
 */
export function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    jeonse: '전세',
    wolse: '월세',
    sale: '매매',
  };
  return labels[type];
}

/**
 * Get full address from property
 */
export function getPropertyAddress(property: Property): string {
  return `${property.buildingName} ${property.dong}동 ${property.hosu}호`;
}
