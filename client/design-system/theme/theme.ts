/**
 * Theme configuration
 * Combines all design tokens into a cohesive theme object
 */

import type { ColorScheme } from '../tokens/colors';
import {
  colors,
  fontFamilies,
  textStyles,
  spacing,
  borderRadius,
  shadows,
} from '../tokens';

/**
 * Creates a theme object for the specified color scheme
 */
export function createTheme(scheme: ColorScheme) {
  return {
    colors: colors[scheme],
    fonts: fontFamilies,
    textStyles,
    spacing,
    borderRadius,
    shadows,
    scheme,
  } as const;
}

/**
 * Light theme
 */
export const lightTheme = createTheme('light');

/**
 * Dark theme
 */
export const darkTheme = createTheme('dark');

/**
 * Theme type derived from the light theme
 * Both light and dark themes share the same structure
 */
export type Theme = typeof lightTheme;
