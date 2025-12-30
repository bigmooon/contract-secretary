import { Card } from '@/components/common/Card';
import { Text, spacing, useThemeColor } from '@/design-system';
import type { Property } from '@/types/property';
import { calculateDaysRemaining } from '@/types/property';
import { FlatList, StyleSheet, View } from 'react-native';

interface PropertyListProps {
  properties: Property[];
  ListHeaderComponent?: React.ReactElement;
}

/**
 * 계약 만료일 기준으로 매물을 정렬합니다.
 * 만료일이 가까운 순서대로 정렬되며, 만료일이 없는 경우 맨 뒤로 이동합니다.
 */
function sortByExpiration(properties: Property[]): Property[] {
  return [...properties].sort((a, b) => {
    const daysA = calculateDaysRemaining(a.expirationDate);
    const daysB = calculateDaysRemaining(b.expirationDate);

    // 만료일이 없는 경우 맨 뒤로
    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1;
    if (daysB === null) return -1;

    // 만료일이 가까운 순서대로 (오름차순)
    return daysA - daysB;
  });
}

export function PropertyList({ properties, ListHeaderComponent }: PropertyListProps) {
  const sortedProperties = sortByExpiration(properties);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="body" style={{ color: textSecondaryColor }}>
          등록된 매물이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedProperties}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Card property={item} />}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={ListHeaderComponent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  separator: {
    height: spacing[3],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[16],
  },
});
