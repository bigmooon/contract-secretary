/**
 * RentalInfo Component
 * Card 2: 임대 정보 (전세/월세/매매) + 갱신 여부 + 임박일 뱃지
 * Displays rental/sale price information and renewal status
 */

import { StyleSheet, View } from 'react-native';
import { DDayBadge, Text, spacing, useTheme } from '@/design-system';
import {
  type Property,
  calculateDaysRemaining,
  formatPrice,
  getPropertyTypeLabel,
} from '@/types/property';
import { DetailCard } from './DetailCard';
import { InfoRow } from './InfoRow';

interface RentalInfoProps {
  property: Property;
}

export function RentalInfo({ property }: RentalInfoProps) {
  const theme = useTheme();
  const daysRemaining = calculateDaysRemaining(property.expirationDate);

  const getPriceLabel = () => {
    switch (property.type) {
      case 'jeonse':
        return '보증금';
      case 'wolse':
        return '보증금';
      case 'sale':
        return '매매가';
    }
  };

  return (
    <DetailCard title="임대 정보">
      <InfoRow label="거래 유형" value={getPropertyTypeLabel(property.type)} />
      <InfoRow label={getPriceLabel()} value={formatPrice(property.deposit)} />
      {property.type === 'wolse' && property.monthlyRent && (
        <InfoRow label="월세" value={formatPrice(property.monthlyRent)} />
      )}
      <InfoRow
        label="갱신 여부"
        value={property.isRenewal ? '갱신' : '신규'}
        valueColor={property.isRenewal ? theme.colors.blue : undefined}
      />
      {daysRemaining !== null && (
        <View style={styles.dDayRow}>
          <Text
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            만료까지
          </Text>
          <DDayBadge daysRemaining={daysRemaining} size="medium" />
        </View>
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  dDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
});
