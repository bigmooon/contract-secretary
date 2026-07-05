/**
 * Themed View Component
 * View component that automatically adapts to the current color scheme
 */

import { View as RNView, type ViewProps } from 'react-native';
import { useThemeColor } from '../theme';

export type ThemedViewProps = ViewProps & {
  /**
   * Override background color
   */
  lightColor?: string;
};

/**
 * View component with automatic theme support
 *
 * @example
 * <View>
 *   <Text>Content</Text>
 * </View>
 *
 * <View lightColor="#fff">
 *   <Text>Custom background</Text>
 * </View>
 */
export function View({ style, lightColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor }, 'background');

  return <RNView style={[{ backgroundColor }, style]} {...otherProps} />;
}
