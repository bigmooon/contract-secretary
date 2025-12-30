/**
 * Property formatting utilities
 */

import type { Property } from '../types';

/**
 * Helper function to calculate days remaining until expiration
 */
export function calculateDaysRemaining(expirationDate?: string | null): number | null {
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
export function formatDate(dateString?: string | null): string {
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
export function getContractTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    JEONSE: '전세',
    WOLSE: '월세',
    MAEMAE: '매매',
    jeonse: '전세',
    wolse: '월세',
    sale: '매매',
  };
  return labels[type] || type;
}

/**
 * Get full address from property
 */
export function getPropertyAddress(property: Property): string {
  return `${property.complexName} ${property.buildingName} ${property.unitNo}`;
}
