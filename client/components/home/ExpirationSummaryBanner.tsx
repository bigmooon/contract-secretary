import {
  Text,
  View as ThemedView,
  borderRadius,
  shadows,
  spacing,
  useThemeColor,
} from '@/design-system';
import { colors } from '@/design-system/tokens/colors';
import type { Property } from '@/types/property';
import { calculateDaysRemaining } from '@/types/property';
import { StyleSheet, View } from 'react-native';

interface ExpirationSummaryBannerProps {
  properties: Property[];
}

interface ExpirationStats {
  thisMonthExpiring: number;
}

function calculateExpirationStats(properties: Property[]): ExpirationStats {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let thisMonthExpiring = 0;

  properties.forEach((property) => {
    if (!property.expirationDate) return;

    const expirationDate = new Date(property.expirationDate);
    const daysRemaining = calculateDaysRemaining(property.expirationDate);

    if (daysRemaining === null || daysRemaining < 0) return;

    // 이번달 만료 건수
    if (
      expirationDate.getMonth() === currentMonth &&
      expirationDate.getFullYear() === currentYear
    ) {
      thisMonthExpiring++;
    }
  });

  return { thisMonthExpiring };
}

export function ExpirationSummaryBanner({
  properties,
}: ExpirationSummaryBannerProps) {
  const stats = calculateExpirationStats(properties);
  const cardColor = useThemeColor({}, 'card');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <ThemedView
      style={[styles.container, shadows.card]}
      lightColor={cardColor}
      darkColor={cardColor}
    >
      <View style={styles.content}>
        {/* 제목 */}
        <View style={styles.title}>
          <View style={styles.titleIcon} />
          <Text
            variant="bodySmall"
            style={{ color: colors.palette.orangeLight }}
          >
            이번 달 만료 임박
          </Text>
        </View>

        {/* 숫자 */}
        <Text
          variant="expirationSummary"
          style={{ color: colors.palette.orangeLight }}
        >
          {stats.thisMonthExpiring}
        </Text>

        {/* 설명 */}
        <Text variant="bodySmall" style={{ color: textSecondaryColor }}>
          건의 계약
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginTop: spacing[4],
    marginBottom: spacing[5],
    gap: spacing[3],
  },
  title: {
    flexDirection: 'row',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    gap: spacing[2],
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.palette.orangeLight + '1A',
  },
  titleIcon: {
    width: 4,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.palette.orangeLight,
  },
  titleText: {
    color: colors.palette.orangeLight,
  },
  content: {
    alignItems: 'center',
    gap: spacing[3],
  },
});
