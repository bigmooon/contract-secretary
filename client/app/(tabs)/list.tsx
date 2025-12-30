import { FloatingAddButton } from '@/components/common';
import { Header } from '@/components/common/Header';
import {
  FilterTabs,
  PropertyListCard,
  SearchBar,
  type FilterType,
} from '@/components/list';
import { Text, View as ThemedView, spacing, useTheme } from '@/design-system';
import { useProperties } from '@/modules/properties/hooks';
import type { Property } from '@/modules/properties/types';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

export default function PropertyListScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // API에서 매물 목록 조회
  const {
    properties,
    isLoading,
    isLoadingMore,
    error,
    refreshProperties,
    fetchMoreProperties,
    pagination,
  } = useProperties({
    includeContracts: true,
    sortBy: 'expirationDate',
    sortOrder: 'asc',
  });

  // 필터링된 매물 목록
  const filteredProperties = useMemo(() => {
    let result = properties;

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (property) =>
          property.complexName.toLowerCase().includes(query) ||
          property.buildingName.toLowerCase().includes(query) ||
          property.unitNo.toLowerCase().includes(query)
      );
    }

    // 타입 필터
    if (selectedFilter !== 'all') {
      result = result.filter((property) =>
        property.contracts?.some((c) => c.contractType === selectedFilter)
      );
    }

    return result;
  }, [properties, searchQuery, selectedFilter]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    refreshProperties();
  }, [refreshProperties]);

  // 무한 스크롤
  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && pagination?.hasNextPage) {
      fetchMoreProperties();
    }
  }, [isLoadingMore, pagination?.hasNextPage, fetchMoreProperties]);

  // 카드 렌더링
  const renderItem = useCallback(
    ({ item }: { item: Property }) => (
      <View style={styles.cardWrapper}>
        <PropertyListCard property={item} />
      </View>
    ),
    []
  );

  // 빈 리스트 표시
  const renderEmptyComponent = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text variant="body" style={{ color: theme.colors.textSecondary }}>
          {searchQuery || selectedFilter !== 'all'
            ? '검색 결과가 없습니다'
            : '등록된 매물이 없습니다'}
        </Text>
      </View>
    );
  }, [isLoading, searchQuery, selectedFilter, theme.colors.textSecondary]);

  // 하단 로딩 인디케이터
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  // 에러 표시
  if (error && !isLoading && properties.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Header title="매물 목록" />
        <View style={styles.errorContainer}>
          <Text variant="body" style={{ color: theme.colors.textSecondary }}>
            매물을 불러오는데 실패했습니다
          </Text>
          <Text
            variant="link"
            onPress={handleRefresh}
            style={{ color: theme.colors.primary }}
          >
            다시 시도
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="매물 목록" />

      {/* 검색 및 필터 영역 */}
      <View
        style={[styles.filterContainer, { backgroundColor: theme.colors.card }]}
      >
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <View style={styles.filterWrapper}>
          <FilterTabs
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </View>
      </View>

      {/* 매물 개수 표시 */}
      <View style={styles.countContainer}>
        <Text variant="caption">총 {filteredProperties.length}개의 매물</Text>
      </View>

      {/* 매물 리스트 */}
      {isLoading && properties.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && properties.length > 0}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
        />
      )}

      <FloatingAddButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[3],
  },
  filterWrapper: {
    marginTop: spacing[1],
  },
  countContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  cardWrapper: {
    marginBottom: spacing[3],
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[16],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  footerLoader: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
});
