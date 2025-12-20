/**
 * Spacing tokens for the design system
 * Provides a consistent scale for margins, paddings, and gaps
 * Based on an 4px base unit
 */

const BASE_UNIT = 4;

/**
 * Spacing scale
 * Uses multiples of the base unit for consistent spacing
 */
export const spacing = {
  0: 0,
  1: BASE_UNIT * 1, // 4px
  2: BASE_UNIT * 2, // 8px
  3: BASE_UNIT * 3, // 12px
  4: BASE_UNIT * 4, // 16px
  5: BASE_UNIT * 5, // 20px
  6: BASE_UNIT * 6, // 24px
  8: BASE_UNIT * 8, // 32px
  10: BASE_UNIT * 10, // 40px
  12: BASE_UNIT * 12, // 48px
  16: BASE_UNIT * 16, // 64px
  20: BASE_UNIT * 20, // 80px
  24: BASE_UNIT * 24, // 96px
} as const;

/**
 * Border radius scale
 * Consistent rounding for UI elements
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999, // For fully rounded elements (pills, circles)
} as const;

/**
 * Common layout spacing presets
 * Semantic names for common spacing patterns
 */
export const layoutSpacing = {
  screenHorizontal: spacing[4], // 16px - Standard horizontal screen padding
  screenVertical: spacing[6], // 24px - Standard vertical screen padding
  sectionGap: spacing[8], // 32px - Gap between major sections
  cardPadding: spacing[4], // 16px - Padding inside cards
  cardGap: spacing[3], // 12px - Gap between cards in a list
} as const;

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
