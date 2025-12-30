import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { borderRadius, colors, spacing, useColorScheme } from '@/design-system';

export function HapticTab({
  children,
  style,
  accessibilityState,
  onPressIn,
  ...restProps
}: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme();
  const isSelected = accessibilityState?.selected ?? false;
  const theme = colors[colorScheme ?? 'light'];

  return (
    <PlatformPressable
      {...restProps}
      accessibilityState={accessibilityState}
      style={styles.container}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    >
      <View
        style={[
          styles.pill,
          isSelected && { backgroundColor: theme.tabSelectedBackground },
        ]}
      >
        {children}
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
});
