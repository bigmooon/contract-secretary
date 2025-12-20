/**
 * Themed Text Component
 * Text component that automatically adapts to the current color scheme
 * and provides predefined text style variants
 */

import { Text as RNText, type TextProps } from 'react-native';
import type { TextStyle as TextStyleType } from '../tokens/typography';
import { textStyles } from '../tokens/typography';
import { useThemeColor } from '../theme';

export type ThemedTextProps = TextProps & {
  /**
   * Override color for light mode
   */
  lightColor?: string;

  /**
   * Override color for dark mode
   */
  darkColor?: string;

  /**
   * Predefined text style variant
   * @default 'body'
   */
  variant?: TextStyleType;
};

/**
 * Text component with automatic theme support and typography variants
 *
 * @example
 * <Text variant="h1">Heading</Text>
 * <Text variant="body">Body text</Text>
 * <Text variant="caption" lightColor="#333">Caption</Text>
 */
export function Text({
  style,
  lightColor,
  darkColor,
  variant = 'body',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const variantStyle = textStyles[variant];

  return (
    <RNText
      style={[
        { color },
        variantStyle,
        style,
      ]}
      {...rest}
    />
  );
}
