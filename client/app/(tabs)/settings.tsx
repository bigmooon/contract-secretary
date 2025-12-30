/**
 * Settings Screen
 * User settings and app configuration
 */

import { ConfirmDialog } from '@/components/common';
import { Header } from '@/components/common/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  Text,
  View as ThemedView,
  borderRadius,
  spacing,
  useTheme,
} from '@/design-system';
import { useAuthStore } from '@/modules/auth';
import Constants from 'expo-constants';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

interface SettingsItemProps {
  icon: 'gearshape.fill' | 'phone.fill' | 'calendar' | 'trash.fill';
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, label, value, onPress, danger }: SettingsItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: theme.colors.card },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: danger
                ? theme.colors.error + '20'
                : theme.colors.primary + '20',
            },
          ]}
        >
          <IconSymbol
            name={icon}
            size={20}
            color={danger ? theme.colors.error : theme.colors.primary}
          />
        </View>
        <Text
          variant="body"
          style={danger ? { color: theme.colors.error } : undefined}
        >
          {label}
        </Text>
      </View>
      {value && (
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          {value}
        </Text>
      )}
      {onPress && !value && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={theme.colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text
        variant="caption"
        style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
      >
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.card }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout, isLoading } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  const handleNotificationSettings = () => {
    Alert.alert('알림 설정', '알림 설정 기능은 준비 중입니다.');
  };

  const handleNaverCalendarSync = () => {
    Alert.alert('네이버 캘린더', '네이버 캘린더 연동 기능은 준비 중입니다.');
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="설정" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 계정 정보 */}
        <SettingsSection title="계정">
          <View style={[styles.userInfo, { backgroundColor: theme.colors.card }]}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Text variant="h2" style={{ color: theme.colors.primary }}>
                {user?.name?.charAt(0) ?? '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text variant="bodySemiBold">{user?.name ?? '사용자'}</Text>
              <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                {user?.email ?? '이메일 없음'}
              </Text>
            </View>
          </View>
        </SettingsSection>

        {/* 알림 설정 */}
        <SettingsSection title="알림">
          <SettingsItem
            icon="calendar"
            label="만기 알림 설정"
            onPress={handleNotificationSettings}
          />
        </SettingsSection>

        {/* 연동 */}
        <SettingsSection title="연동">
          <SettingsItem
            icon="calendar"
            label="네이버 캘린더 연동"
            onPress={handleNaverCalendarSync}
          />
        </SettingsSection>

        {/* 앱 정보 */}
        <SettingsSection title="앱 정보">
          <SettingsItem icon="gearshape.fill" label="버전" value={appVersion} />
        </SettingsSection>

        {/* 계정 관리 */}
        <SettingsSection title="계정 관리">
          <SettingsItem
            icon="trash.fill"
            label="로그아웃"
            onPress={() => setShowLogoutDialog(true)}
            danger
          />
        </SettingsSection>

        {/* 여백 */}
        <View style={styles.footer} />
      </ScrollView>

      {/* 로그아웃 확인 다이얼로그 */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
        isDestructive
      />
    </ThemedView>
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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    gap: spacing[1],
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    minHeight: 56,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    height: spacing[10],
  },
});
