import { Header } from '@/components/common/Header';
import { ExpirationSummaryBanner, PropertyList } from '@/components/home';
import { useThemeColor } from '@/design-system';
import type { Property } from '@/types/property';
import { StyleSheet, View } from 'react-native';

function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getDateBeforeDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Mock data for development - replace with API call
const mockProperties: Property[] = [
  {
    id: '1',
    type: 'jeonse',
    buildingName: '반도유보라',
    dong: '101',
    hosu: '1501',
    sizeType: '34평형',
    deposit: 450000000,
    contractDate: getDateBeforeDays(365),
    expirationDate: getDateAfterDays(5), // D-5 (urgent)
    isRenewal: false,
    ownerContacts: [{ name: '김소유', phone: '010-1234-5678' }],
    tenantContacts: [{ name: '이세입', phone: '010-8765-4321' }],
    notes: '3월 중순 입주 희망',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    type: 'wolse',
    buildingName: '보문아이파크',
    dong: '105',
    hosu: '2031',
    sizeType: '28평형',
    deposit: 50000000,
    monthlyRent: 1200000,
    contractDate: getDateBeforeDays(300),
    expirationDate: getDateAfterDays(25), // D-25 (warning)
    isRenewal: true,
    ownerContacts: [{ name: '박주인', phone: '010-2222-3333' }],
    notes: '주차 2대 가능',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    type: 'jeonse',
    buildingName: '래미안 블레스티지',
    dong: '203',
    hosu: '801',
    sizeType: '42평형',
    deposit: 680000000,
    contractDate: getDateBeforeDays(400),
    expirationDate: getDateAfterDays(60), // D-60 (approaching)
    isRenewal: false,
    ownerContacts: [{ name: '최집주', phone: '010-4444-5555' }],
    tenantContacts: [{ name: '정임대', phone: '010-6666-7777' }],
    notes: '리모델링 완료',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '4',
    type: 'sale',
    buildingName: '힐스테이트',
    dong: '108',
    hosu: '1202',
    sizeType: '38평형',
    deposit: 850000000,
    ownerContacts: [{ name: '강판매', phone: '010-9999-0000' }],
    notes: '급매',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z',
  },
  {
    id: '5',
    type: 'wolse',
    buildingName: '반도유보라',
    dong: '102',
    hosu: '502',
    sizeType: '24평형',
    deposit: 30000000,
    monthlyRent: 900000,
    contractDate: getDateBeforeDays(180),
    expirationDate: getDateAfterDays(3), // D-3 (urgent)
    isRenewal: false,
    ownerContacts: [{ name: '임월세', phone: '010-1111-2222' }],
    tenantContacts: [{ name: '한세입', phone: '010-3333-4444' }],
    notes: '1층 상가 근접',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
  },
  {
    id: '6',
    type: 'jeonse',
    buildingName: '푸르지오',
    dong: '301',
    hosu: '1101',
    sizeType: '32평형',
    deposit: 520000000,
    contractDate: getDateBeforeDays(350),
    expirationDate: getDateAfterDays(120), // D-120 (safe)
    isRenewal: true,
    ownerContacts: [{ name: '윤소유', phone: '010-5555-6666' }],
    tenantContacts: [{ name: '조임차', phone: '010-7777-8888' }],
    notes: '남향 탁트인 조망',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '7',
    type: 'jeonse',
    buildingName: '래미안 퍼스트',
    dong: '104',
    hosu: '903',
    sizeType: '36평형',
    deposit: 580000000,
    contractDate: getDateBeforeDays(330),
    expirationDate: getDateAfterDays(15), // D-15 (warning)
    isRenewal: false,
    ownerContacts: [{ name: '백주인', phone: '010-1212-3434' }],
    notes: '역세권',
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-01T00:00:00Z',
  },
];

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="계약 관리" date={true} variant="home" />
      <PropertyList
        properties={mockProperties}
        ListHeaderComponent={
          <ExpirationSummaryBanner properties={mockProperties} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
