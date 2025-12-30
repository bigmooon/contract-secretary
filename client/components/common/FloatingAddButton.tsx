/**
 * Floating Add Button (FAB)
 * A floating action button for adding new properties
 */

import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  borderRadius,
  shadows,
  spacing,
  useThemeColor,
} from '@/design-system';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

interface FloatingAddButtonProps {
  onPress?: () => void;
}

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/property/add');
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primaryColor },
        shadows.card,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityLabel="매물 추가"
      accessibilityRole="button"
    >
      <IconSymbol name="plus" size={28} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[4],
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
