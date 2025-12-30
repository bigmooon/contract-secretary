/**
 * SearchBar Component
 * 검색 입력 필드 컴포넌트
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import {
  borderRadius,
  colors,
  fontFamilies,
  fontSizes,
  spacing,
  useTheme,
} from '@/design-system';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = '건물명, 동호수로 검색',
}: SearchBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color={theme.colors.textSecondary}
          onPress={() => onChangeText('')}
          style={styles.clearIcon}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  icon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.regular,
    paddingVertical: spacing[2],
  },
  clearIcon: {
    marginLeft: spacing[2],
  },
});
