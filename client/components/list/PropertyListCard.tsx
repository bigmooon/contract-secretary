import {
  DDayBadge,
  PropertyTypeBadge,
  Text,
  View as ThemedView,
  borderRadius,
  shadows,
  spacing,
  useTheme,
} from '@/design-system';
import type { ContractType, Property } from '@/modules/properties/types';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

interface PropertyListCardProps {
  property: Property;
}

/**
 * 서버 ContractType을 클라이언트 PropertyType으로 변환
 */
function convertContractType(
  contractType: ContractType
): 'jeonse' | 'wolse' | 'sale' {
  switch (contractType) {
    case 'JEONSE':
      return 'jeonse';
    case 'WOLSE':
      return 'wolse';
    case 'MAEMAE':
      return 'sale';
    default:
      return 'jeonse';
  }
}

/**
 * 가격 포맷팅 (한국식)
 */
function formatPrice(price: number): string {
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

export function PropertyListCard({ property }: PropertyListCardProps) {
  const theme = useTheme();
  const router = useRouter();

  // 주소 생성
  const address = `${property.complexName} ${property.buildingName}동 ${property.unitNo}호`;

  // 계약 정보 (첫 번째 활성 계약 사용)
  const activeContract = property.contracts?.find((c) => c.status === 'ACTIVE');
  const contractType = activeContract?.contractType || 'JEONSE';
  const daysRemaining = activeContract?.dDay ?? null;

  const handlePress = () => {
    router.push(`/property/${property.id}` as any);
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView
        style={[
          styles.card,
          shadows.card,
          {
            borderRadius: borderRadius.lg,
            padding: spacing[4],
          },
        ]}
        lightColor={theme.colors.card}
        darkColor={theme.colors.card}
      >
        {/* 헤더: 타입 뱃지 + 주소 + D-Day */}
        <View style={styles.cardHeader}>
          <PropertyTypeBadge
            type={convertContractType(contractType)}
            size="medium"
          />
          <Text
            variant="bodySemiBold"
            style={styles.cardTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {address}
          </Text>
          {daysRemaining !== null && (
            <DDayBadge daysRemaining={daysRemaining} size="medium" />
          )}
        </View>

        {/* 상세 정보 */}
        <View
          style={[
            styles.cardContent,
            {
              marginTop: spacing[3],
              padding: spacing[3],
              borderRadius: borderRadius.md,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          {/* 타입/평수 정보 */}
          {property.typeInfo && (
            <Text variant="caption" style={styles.typeInfo}>
              {property.typeInfo}
            </Text>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    textAlign: 'left',
    marginHorizontal: spacing[2],
  },
  cardContent: {},
  typeInfo: {
    marginBottom: spacing[1],
  },
});
