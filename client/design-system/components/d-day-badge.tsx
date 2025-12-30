/**
 * D-Day Badge Component
 * Displays contract expiration status with color-coded urgency levels
 *
 * Color scheme based on days remaining:
 * - D-7 or less: Red (urgent)
 * - D-30 or less: Orange (warning)
 * - D-90 or less: Yellow (approaching)
 * - More than D-90: Green (safe)
 * - Expired: Red with "만료" text
 */

import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '../theme';
import { borderRadius, spacing } from '../tokens/spacing';
import { fontFamilies, fontSizes } from '../tokens/typography';
import { Text } from './text';

export type DDayVariant =
  | 'expired'
  | 'urgent'
  | 'warning'
  | 'approaching'
  | 'safe';

export interface DDayBadgeProps {
  /**
   * Number of days until contract expiration
   * Negative values indicate expired contracts
   */
  daysRemaining: number;

  /**
   * Size variant of the badge
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Determines the variant based on days remaining
 */
function getVariant(daysRemaining: number): DDayVariant {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return 'urgent';
  if (daysRemaining <= 30) return 'warning';
  if (daysRemaining <= 90) return 'approaching';
  return 'safe';
}

/**
 * Formats the display text for the badge
 */
function formatDDayText(daysRemaining: number): string {
  if (daysRemaining < 0) return '만료';
  if (daysRemaining === 0) return 'D-Day';
  return `D-${daysRemaining}`;
}

/**
 * D-Day Badge component that displays contract expiration status
 *
 * @example
 * // Urgent (7 days or less)
 * <DDayBadge daysRemaining={5} />
 *
 * // Warning (30 days or less)
 * <DDayBadge daysRemaining={25} />
 *
 * // Approaching (90 days or less)
 * <DDayBadge daysRemaining={60} />
 *
 * // Safe (more than 90 days)
 * <DDayBadge daysRemaining={120} />
 *
 * // Expired
 * <DDayBadge daysRemaining={-5} />
 */
export function DDayBadge({ daysRemaining, size = 'medium' }: DDayBadgeProps) {
  const variant = getVariant(daysRemaining);
  const displayText = formatDDayText(daysRemaining);

  // Get theme colors
  const redColor = useThemeColor({}, 'red');
  const orangeColor = useThemeColor({}, 'orange');
  const yellowColor = useThemeColor({}, 'yellow');
  const greenColor = useThemeColor({}, 'green');
  const whiteColor = useThemeColor({}, 'textInverse');

  // Background colors with opacity
  const backgroundColors: Record<DDayVariant, string> = {
    expired: `${redColor}`,
    urgent: `${redColor}`,
    warning: `${orangeColor}`,
    approaching: `${yellowColor}`,
    safe: `${greenColor}`,
  };

  // Text colors (solid)
  const textColors: Record<DDayVariant, string> = {
    expired: whiteColor,
    urgent: whiteColor,
    warning: whiteColor,
    approaching: whiteColor,
    safe: whiteColor,
  };

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  return (
    <View
      style={[
        styles.container,
        sizeStyles[size],
        { backgroundColor: backgroundColors[variant] },
      ]}
    >
      <Text
        style={[
          styles.text,
          textSizeStyles[size],
          { color: textColors[variant] },
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing[2], // 8px
    paddingVertical: spacing[1], // 4px
  },
  medium: {
    paddingHorizontal: spacing[3], // 16px
    paddingVertical: spacing[1], // 8px
  },
  large: {
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[3], // 12px
  },
  text: {
    fontFamily: fontFamilies.semiBold,
  },
  textSmall: {
    fontSize: fontSizes.xs,
  },
  textMedium: {
    fontSize: fontSizes.base,
  },
  textLarge: {
    fontSize: fontSizes.base,
  },
});
