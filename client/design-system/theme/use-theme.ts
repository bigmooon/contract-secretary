/**
 * Theme hooks
 * Provides access to the current theme based on the device color scheme
 */

import { useColorScheme as useRNColorScheme } from 'react-native';
import type { ColorScheme, ColorName } from '../tokens/colors';
import { colors } from '../tokens';
import { lightTheme, darkTheme, type Theme } from './theme';

/**
 * Re-export useColorScheme from React Native
 */
export { useRNColorScheme as useColorScheme };

/**
 * Hook to get the current theme based on the device color scheme
 * Falls back to light theme if color scheme cannot be determined
 */
export function useTheme(): Theme {
  const colorScheme = useRNColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

/**
 * Hook to get a specific color from the current theme
 * Supports overriding colors for light and dark modes
 *
 * @param props - Optional color overrides for light and dark modes
 * @param colorName - Name of the color from the theme
 * @returns The resolved color value
 *
 * @example
 * const backgroundColor = useThemeColor({}, 'background');
 * const customColor = useThemeColor({ light: '#fff', dark: '#000' }, 'card');
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
): string {
  const colorScheme: ColorScheme = useRNColorScheme() ?? 'light';
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return colors[colorScheme][colorName];
}
