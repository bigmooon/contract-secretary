/**
 * Property Detail Page
 * Displays detailed property information in 4 card sections
 * Route: /property/[id]
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ConfirmDialog } from '@/components/common';
import {
  ContactMemo,
  ContractInfo,
  PropertyBasicInfo,
  RentalInfo,
} from '@/components/detail';
import {
  PropertyTypeBadge,
  Text,
  View as ThemedView,
  spacing,
  useTheme,
} from '@/design-system';
import { type Property, getPropertyAddress } from '@/types/property';

// Mock data for development - replace with API call
const mockProperty: Property = {
  id: '1',
  type: 'jeonse',
  buildingName: '보문아이파크',
  dong: '105',
  hosu: '2031',
  sizeType: '34평형',
  deposit: 350000000,
  contractDate: '2024-03-15',
  expirationDate: '2026-03-14',
  isRenewal: false,
  ownerContacts: [
    { name: '김소유', phone: '010-1234-5678' },
    { phone: '010-9876-5432' },
  ],
  tenantContacts: [{ name: '이세입', phone: '010-5555-6666' }],
  notes: '3월 중순 입주 희망. 애완동물 가능 여부 확인 필요.',
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // TODO: Fetch property data by id from API
  const property = mockProperty;
  const address = getPropertyAddress(property);

  const handleEdit = () => {
    router.push(`/property/edit/${id}` as any);
  };

  const handleDeletePress = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      // TODO: Call API to delete property
      console.log('Delete property:', id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setShowDeleteDialog(false);

      Alert.alert('삭제 완료', '매물이 삭제되었습니다.', [
        {
          text: '확인',
          onPress: () => router.replace('/(tabs)' as any),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', '매물 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '매물 상세',
          headerBackTitle: '뒤로',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable onPress={handleEdit} style={styles.headerButton}>
                <Ionicons
                  name="pencil"
                  size={22}
                  color={theme.colors.primary}
                />
              </Pressable>
              <Pressable onPress={handleDeletePress} style={styles.headerButton}>
                <Ionicons name="trash" size={22} color={theme.colors.red} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with address and property type */}
          <View style={styles.header}>
            <PropertyTypeBadge type={property.type} size="medium" />
            <Text variant="h3" style={styles.addressText}>
              {address}
            </Text>
          </View>

          {/* 4 Information Cards */}
          <PropertyBasicInfo property={property} />
          <RentalInfo property={property} />
          <ContractInfo property={property} />
          <ContactMemo property={property} />
        </ScrollView>
      </ThemedView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="매물 삭제"
        message={`"${address}" 매물을 삭제하시겠습니까?\n삭제된 매물은 복구할 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  addressText: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  headerButton: {
    padding: spacing[1],
  },
});
