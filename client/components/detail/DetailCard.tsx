/**
 * DetailCard Component
 * Reusable card wrapper for detail page sections
 */

import { StyleSheet, View, type ViewProps } from 'react-native';
import {
  Text,
  View as ThemedView,
  borderRadius,
  shadows,
  spacing,
  useTheme,
} from '@/design-system';

interface DetailCardProps extends ViewProps {
  title: string;
  children: React.ReactNode;
}

export function DetailCard({ title, children, style, ...props }: DetailCardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      style={[styles.card, shadows.card, { backgroundColor: theme.colors.card }, style]}
      {...props}
    >
      <Text variant="h4" style={styles.title}>
        {title}
      </Text>
      <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
      <View>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  title: {
    marginBottom: spacing[3],
  },
  divider: {
    height: 1,
    marginBottom: spacing[3],
  },
});
