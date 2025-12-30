/**
 * ContractInfo Component
 * Card 3: 계약 정보
 * Displays contract dates (start and expiration)
 */

import { type Property, formatDate } from '@/types/property';
import { DetailCard } from './DetailCard';
import { InfoRow } from './InfoRow';

interface ContractInfoProps {
  property: Property;
}

export function ContractInfo({ property }: ContractInfoProps) {
  return (
    <DetailCard title="계약 정보">
      <InfoRow label="계약일" value={formatDate(property.contractDate)} />
      <InfoRow label="만기일" value={formatDate(property.expirationDate)} />
    </DetailCard>
  );
}
