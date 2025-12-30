/**
 * InfoRow Component
 * Displays a label-value pair in a row format for detail pages
 */

import { StyleSheet, View } from 'react-native';
import { Text, spacing, useTheme } from '@/design-system';

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function InfoRow({ label, value, valueColor }: InfoRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text
        variant="body"
        style={[styles.label, { color: theme.colors.textSecondary }]}
      >
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.value, valueColor ? { color: valueColor } : undefined]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  label: {
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
});
