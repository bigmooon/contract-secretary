/**
 * FormSwitch Component
 * Toggle switch with label for forms (renewal status, etc.)
 */

import { StyleSheet, Switch, View } from 'react-native';
import { Text, spacing, useTheme } from '@/design-system';

interface FormSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function FormSwitch({ label, value, onChange }: FormSwitchProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: theme.colors.outline,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.card}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
});
