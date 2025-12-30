/**
 * FormSelect Component
 * Selection input with label for forms (property type, etc.)
 */

import { Pressable, StyleSheet, View } from 'react-native';
import {
  Text,
  borderRadius,
  spacing,
  useTheme,
} from '@/design-system';

interface Option<T> {
  label: string;
  value: T;
}

interface FormSelectProps<T> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FormSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: FormSelectProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.background,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.outline,
                },
              ]}
            >
              <Text
                variant="bodyMedium"
                style={{
                  color: isSelected
                    ? theme.colors.textInverse
                    : theme.colors.text,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  option: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
});
