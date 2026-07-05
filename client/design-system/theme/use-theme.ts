/**
 * Theme hooks
 * Provides access to the current theme based on the device color scheme
 */

import type { ColorName } from '../tokens/colors';
import { colors } from '../tokens';
import { lightTheme, type Theme } from './theme';

// ponytail: dark mode removed — app is light-only. Always report 'light'.
export function useColorScheme(): 'light' {
  return 'light';
}

/**
 * Hook to get the current theme. Always light.
 */
export function useTheme(): Theme {
  return lightTheme;
}

/**
 * Hook to get a specific color from the light theme.
 * An optional `light` override still applies.
 */
export function useThemeColor(
  props: { light?: string },
  colorName: ColorName
): string {
  return props.light ?? colors.light[colorName];
}
