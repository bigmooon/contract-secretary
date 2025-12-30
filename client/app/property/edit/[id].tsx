/**
 * Property Edit Page
 * Form for editing existing property information
 * Route: /property/edit/[id]
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ContactInputGroup,
  FormInput,
  FormSelect,
  FormSwitch,
} from '@/components/form';
import {
  Button,
  Text,
  View as ThemedView,
  spacing,
} from '@/design-system';
import type { Contact, Property, PropertyType } from '@/types/property';

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

const propertyTypeOptions: { label: string; value: PropertyType }[] = [
  { label: '전세', value: 'jeonse' },
  { label: '월세', value: 'wolse' },
  { label: '매매', value: 'sale' },
];

interface FormData {
  type: PropertyType;
  buildingName: string;
  dong: string;
  hosu: string;
  sizeType: string;
  deposit: string;
  monthlyRent: string;
  contractDate: string;
  expirationDate: string;
  isRenewal: boolean;
  ownerContacts: Contact[];
  tenantContacts: Contact[];
  notes: string;
}

function propertyToFormData(property: Property): FormData {
  return {
    type: property.type,
    buildingName: property.buildingName,
    dong: property.dong,
    hosu: property.hosu,
    sizeType: property.sizeType || '',
    deposit: String(property.deposit / 10000),
    monthlyRent: property.monthlyRent ? String(property.monthlyRent / 10000) : '',
    contractDate: property.contractDate || '',
    expirationDate: property.expirationDate || '',
    isRenewal: property.isRenewal || false,
    ownerContacts: property.ownerContacts.length > 0
      ? property.ownerContacts
      : [{ phone: '' }],
    tenantContacts: property.tenantContacts && property.tenantContacts.length > 0
      ? property.tenantContacts
      : [{ phone: '' }],
    notes: property.notes || '',
  };
}

export default function PropertyEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Fetch property data by id from API
  const property = mockProperty;

  const [formData, setFormData] = useState<FormData>(() =>
    propertyToFormData(property)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.buildingName.trim()) {
      Alert.alert('오류', '건물명을 입력해주세요.');
      return false;
    }
    if (!formData.dong.trim()) {
      Alert.alert('오류', '동을 입력해주세요.');
      return false;
    }
    if (!formData.hosu.trim()) {
      Alert.alert('오류', '호수를 입력해주세요.');
      return false;
    }
    if (!formData.deposit.trim() || isNaN(Number(formData.deposit))) {
      Alert.alert('오류', '보증금/매매가를 올바르게 입력해주세요.');
      return false;
    }
    if (
      formData.type === 'wolse' &&
      (!formData.monthlyRent.trim() || isNaN(Number(formData.monthlyRent)))
    ) {
      Alert.alert('오류', '월세를 올바르게 입력해주세요.');
      return false;
    }
    const validOwnerContacts = formData.ownerContacts.filter(
      (c) => c.phone.trim()
    );
    if (validOwnerContacts.length === 0) {
      Alert.alert('오류', '주인 연락처를 최소 1개 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Call API to update property
      const updateData = {
        ...formData,
        deposit: Number(formData.deposit) * 10000,
        monthlyRent: formData.monthlyRent
          ? Number(formData.monthlyRent) * 10000
          : undefined,
        ownerContacts: formData.ownerContacts.filter((c) => c.phone.trim()),
        tenantContacts: formData.tenantContacts.filter((c) => c.phone.trim()),
      };

      console.log('Update property:', id, updateData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      Alert.alert('성공', '매물 정보가 수정되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('오류', '매물 정보 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '매물 수정',
          headerBackTitle: '취소',
        }}
      />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 매물 유형 */}
            <FormSelect
              label="매물 유형"
              options={propertyTypeOptions}
              value={formData.type}
              onChange={(value) => updateField('type', value)}
            />

            {/* 기본 정보 */}
            <Text variant="h4" style={styles.sectionTitle}>
              기본 정보
            </Text>

            <FormInput
              label="건물명"
              value={formData.buildingName}
              onChangeText={(value) => updateField('buildingName', value)}
              placeholder="예: 보문아이파크"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <FormInput
                  label="동"
                  value={formData.dong}
                  onChangeText={(value) => updateField('dong', value)}
                  placeholder="예: 105"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <FormInput
                  label="호수"
                  value={formData.hosu}
                  onChangeText={(value) => updateField('hosu', value)}
                  placeholder="예: 2031"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <FormInput
              label="타입/평수 (선택)"
              value={formData.sizeType}
              onChangeText={(value) => updateField('sizeType', value)}
              placeholder="예: 34평형"
            />

            {/* 가격 정보 */}
            <Text variant="h4" style={styles.sectionTitle}>
              가격 정보
            </Text>

            <FormInput
              label={formData.type === 'sale' ? '매매가 (만원)' : '보증금 (만원)'}
              value={formData.deposit}
              onChangeText={(value) => updateField('deposit', value)}
              placeholder="예: 35000"
              keyboardType="number-pad"
            />

            {formData.type === 'wolse' && (
              <FormInput
                label="월세 (만원)"
                value={formData.monthlyRent}
                onChangeText={(value) => updateField('monthlyRent', value)}
                placeholder="예: 100"
                keyboardType="number-pad"
              />
            )}

            {/* 계약 정보 */}
            <Text variant="h4" style={styles.sectionTitle}>
              계약 정보
            </Text>

            <FormInput
              label="계약일 (선택)"
              value={formData.contractDate}
              onChangeText={(value) => updateField('contractDate', value)}
              placeholder="예: 2024-03-15"
            />

            <FormInput
              label="만기일 (선택)"
              value={formData.expirationDate}
              onChangeText={(value) => updateField('expirationDate', value)}
              placeholder="예: 2026-03-14"
            />

            <FormSwitch
              label="갱신 여부"
              value={formData.isRenewal}
              onChange={(value) => updateField('isRenewal', value)}
            />

            {/* 연락처 */}
            <Text variant="h4" style={styles.sectionTitle}>
              연락처
            </Text>

            <ContactInputGroup
              label="주인 연락처"
              contacts={formData.ownerContacts}
              onChange={(contacts) => updateField('ownerContacts', contacts)}
            />

            <ContactInputGroup
              label="세입자 연락처 (선택)"
              contacts={formData.tenantContacts}
              onChange={(contacts) => updateField('tenantContacts', contacts)}
            />

            {/* 메모 */}
            <FormInput
              label="메모 (선택)"
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder="특이사항, 비고 등"
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            {/* 저장 버튼 */}
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.submitButton}
            >
              저장하기
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  sectionTitle: {
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing[6],
  },
});
