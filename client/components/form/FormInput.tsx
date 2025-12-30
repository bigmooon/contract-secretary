/**
 * FormInput Component
 * Text input field with label for forms
 */

import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';
import {
  Text,
  borderRadius,
  fontSizes,
  spacing,
  useTheme,
} from '@/design-system';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: error ? theme.colors.red : theme.colors.outline,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.placeholder}
        {...props}
      />
      {error && (
        <Text variant="caption" style={[styles.error, { color: theme.colors.red }]}>
          {error}
        </Text>
      )}
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
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: fontSizes.base,
  },
  error: {
    marginTop: spacing[1],
  },
});
