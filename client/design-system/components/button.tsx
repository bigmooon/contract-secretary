/**
 * Themed Button Component
 * Button component that automatically adapts to the current color scheme
 * and provides predefined button variants
 */

import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useThemeColor } from '../theme';
import { colors } from '../tokens/colors';
import { borderRadius, spacing } from '../tokens/spacing';
import { fontFamilies, fontSizes } from '../tokens/typography';
import { Text } from './text';

const NAVER_GREEN = colors.palette.greenLight;
const NAVER_GREEN_PRESSED = colors.palette.greenLight + 'CC';
const NAVER_GREEN_DISABLED = colors.palette.greenLight + '66';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'naver';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  /**
   * Button content - can be a string or any ReactNode
   */
  children: ReactNode;

  /**
   * Button style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Show loading spinner and disable button
   * @default false
   */
  loading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Custom style override
   */
  style?: ViewStyle;
};

/**
 * Button component with automatic theme support and multiple variants
 *
 * @example
 * <Button onPress={handlePress}>Click me</Button>
 * <Button variant="secondary" size="lg">Large Secondary</Button>
 * <Button variant="outline" loading>Loading...</Button>
 * <Button variant="ghost" fullWidth>Ghost Full Width</Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');
  const textInverse = useThemeColor({}, 'textInverse');
  const textColor = useThemeColor({}, 'text');
  const outline = useThemeColor({}, 'outline');

  const isDisabled = disabled || loading;

  const getBackgroundColor = (pressed: boolean): string => {
    if (isDisabled) {
      if (variant === 'naver') return NAVER_GREEN_DISABLED;
      return variant === 'primary' || variant === 'secondary'
        ? `${primary}40`
        : 'transparent';
    }

    switch (variant) {
      case 'primary':
        return pressed ? `${primary}CC` : primary;
      case 'secondary':
        return pressed ? `${primary}20` : `${primary}10`;
      case 'outline':
        return pressed ? `${primary}10` : 'transparent';
      case 'ghost':
        return pressed ? `${primary}10` : 'transparent';
      case 'naver':
        return pressed ? NAVER_GREEN_PRESSED : NAVER_GREEN;
      default:
        return primary;
    }
  };

  const getBorderColor = (): string => {
    if (isDisabled) {
      return variant === 'outline' ? `${primary}40` : 'transparent';
    }

    return variant === 'outline' ? primary : 'transparent';
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      if (variant === 'primary' || variant === 'naver')
        return colors.palette.white;
      return `${textColor}60`;
    }

    switch (variant) {
      case 'primary':
      case 'naver':
        return colors.palette.white;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return primary;
      default:
        return textInverse;
    }
  };

  const sizeStyles = SIZE_STYLES[size];

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : typeof children === 'string' ? (
        <Text style={[sizeStyles.text, { color: getTextColor() }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const SIZE_STYLES: Record<
  ButtonSize,
  { container: ViewStyle; text: TextStyle }
> = {
  sm: {
    container: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.sm,
      minHeight: 32,
    },
    text: {
      fontFamily: fontFamilies.medium,
      fontSize: fontSizes.sm,
      textAlign: 'center',
    },
  },
  md: {
    container: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.md,
      minHeight: 44,
    },
    text: {
      fontFamily: fontFamilies.semiBold,
      fontSize: fontSizes.base,
      textAlign: 'center',
    },
  },
  lg: {
    container: {
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.md,
      minHeight: 56,
    },
    text: {
      fontFamily: fontFamilies.semiBold,
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
  },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  loader: {
    marginRight: spacing[2],
  },
});
