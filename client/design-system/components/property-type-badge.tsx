/**
 * Property Type Badge Component
 * Displays property type (전세/월세/매매) with color-coded variants
 *
 * Color scheme:
 * - 전세 (Jeonse/Deposit): Blue
 * - 월세 (Wolse/Monthly Rent): Green
 * - 매매 (Sale): Purple
 */

import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '../theme';
import { borderRadius, spacing } from '../tokens/spacing';
import { fontFamilies, fontSizes } from '../tokens/typography';
import { Text } from './text';

export type PropertyType = 'jeonse' | 'wolse' | 'sale';

export interface PropertyTypeBadgeProps {
  /**
   * Type of property contract
   */
  type: PropertyType;

  /**
   * Size variant of the badge
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Korean labels for each property type
 */
const typeLabels: Record<PropertyType, string> = {
  jeonse: '전세',
  wolse: '월세',
  sale: '매매',
};

/**
 * Property Type Badge component that displays contract type
 *
 * @example
 * // Jeonse (Blue)
 * <PropertyTypeBadge type="jeonse" />
 *
 * // Wolse (Green)
 * <PropertyTypeBadge type="wolse" />
 *
 * // Sale (Purple)
 * <PropertyTypeBadge type="sale" />
 */
export function PropertyTypeBadge({
  type,
  size = 'medium',
}: PropertyTypeBadgeProps) {
  const displayText = typeLabels[type];

  // Get theme colors
  const blueColor = useThemeColor({}, 'blue');
  const greenColor = useThemeColor({}, 'green');
  const purpleColor = useThemeColor({}, 'purple');
  const whiteColor = useThemeColor({}, 'textInverse');

  // Background colors for each type
  const backgroundColors: Record<PropertyType, string> = {
    jeonse: blueColor,
    wolse: greenColor,
    sale: purpleColor,
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
        { backgroundColor: backgroundColors[type] },
      ]}
    >
      <Text style={[styles.text, textSizeStyles[size], { color: whiteColor }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: spacing[2], // 8px
    paddingVertical: spacing[1], // 4px
  },
  medium: {
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[1], // 4px
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
