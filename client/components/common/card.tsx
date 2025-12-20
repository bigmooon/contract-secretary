/**
 * Card Component
 * Displays contract information in a card format
 */

import {
  Text,
  View as ThemedView,
  borderRadius,
  colors,
  shadows,
  spacing,
  useTheme,
} from '@/design-system';
import { StyleSheet, View } from 'react-native';

export function Card() {
  const theme = useTheme();

  return (
    <ThemedView
      style={[
        styles.card,
        shadows.card,
        {
          borderRadius: borderRadius.lg,
          padding: spacing[4],
        },
      ]}
      lightColor={colors.light.card}
      darkColor={colors.dark.card}
    >
      <View style={styles.cardHeader}>
        <Text variant="bodySemiBold">강남 오피스텔 A동 101호</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.error,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[1],
            },
          ]}
        >
          <Text variant="caption" style={{ color: colors.light.textInverse }}>
            D-10
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.cardContent,
          {
            marginTop: spacing[3],
            padding: spacing[3],
            borderRadius: borderRadius.md,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Text variant="body">카드</Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    // Additional content styles if needed
  },
});
