/**
 * PropertyBasicInfo Component
 * Card 1: 매물 기본 정보
 * Displays basic property information (building, unit, type)
 */

import { type Property, getPropertyTypeLabel } from '@/types/property';
import { DetailCard } from './DetailCard';
import { InfoRow } from './InfoRow';

interface PropertyBasicInfoProps {
  property: Property;
}

export function PropertyBasicInfo({ property }: PropertyBasicInfoProps) {
  return (
    <DetailCard title="매물 기본 정보">
      <InfoRow label="건물명" value={property.buildingName} />
      <InfoRow label="동/호수" value={`${property.dong}동 ${property.hosu}호`} />
      {property.sizeType && (
        <InfoRow label="타입/평수" value={property.sizeType} />
      )}
      <InfoRow label="매물 유형" value={getPropertyTypeLabel(property.type)} />
    </DetailCard>
  );
}
