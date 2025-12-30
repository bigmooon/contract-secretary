/**
 * FilterTabs Component
 * 매물 타입 필터 탭 컴포넌트 (전체/전세/월세/매매)
 */

import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  borderRadius,
  colors,
  spacing,
  useTheme,
} from '@/design-system';
import type { ContractType } from '@/modules/properties/types';

type FilterType = 'all' | ContractType;

interface FilterOption {
  key: FilterType;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: '전체' },
  { key: 'JEONSE', label: '전세' },
  { key: 'WOLSE', label: '월세' },
  { key: 'MAEMAE', label: '매매' },
];

interface FilterTabsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterTabs({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selectedFilter === option.key;

        return (
          <Pressable
            key={option.key}
            onPress={() => onFilterChange(option.key)}
            style={[
              styles.tab,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.outline,
              },
            ]}
          >
            <Text
              variant="bodyMedium"
              style={[
                styles.tabText,
                {
                  color: isSelected
                    ? theme.colors.textInverse
                    : theme.colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export type { FilterType };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    textAlign: 'center',
  },
});
