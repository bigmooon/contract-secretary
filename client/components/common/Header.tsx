import { IconSymbol } from '@/components/ui/IconSymbol';
import {
  Text as ThemedText,
  borderRadius,
  layoutSpacing,
  shadows,
  spacing,
  useThemeColor,
} from '@/design-system';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeaderVariant = 'home' | 'default';

type HeaderProps = PropsWithChildren<{
  title: string;
  date?: boolean;
  variant?: HeaderVariant;
}>;

const formatKoreanDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${weekday}`;
};

export function Header({
  title,
  date = false,
  variant = 'default',
}: HeaderProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const iconBgColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'textSecondary');

  const today = formatKoreanDate(new Date());
  const isHome = variant === 'home';

  return (
    <View style={[styles.headerContainer, { backgroundColor }, shadows.card]}>
      <SafeAreaView edges={['top']}>
        <View
          style={[
            styles.header,
            isHome ? styles.headerHome : styles.headerDefault,
          ]}
        >
          {date && (
            <View style={[styles.dateRow, isHome && styles.dateRowHome]}>
              <View
                style={[styles.iconContainer, { backgroundColor: iconBgColor }]}
              >
                <IconSymbol name="calendar" size={18} color={iconColor} />
              </View>
              <ThemedText variant="bodyMedium" style={styles.dateText}>
                {today}
              </ThemedText>
            </View>
          )}
          <ThemedText variant={isHome ? 'h1' : 'h2'} style={styles.title}>
            {title}
          </ThemedText>
          {date && (
            <View
              style={[styles.titleUnderline, { backgroundColor: primaryColor }]}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
  },
  header: {
    gap: spacing[3],
    alignItems: 'center',
  },
  headerHome: {
    paddingTop: layoutSpacing.headerPaddingTop,
    paddingBottom: layoutSpacing.headerPaddingBottom,
  },
  headerDefault: {
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dateRowHome: {
    marginTop: -layoutSpacing.headerPaddingTop,
  },
  iconContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    letterSpacing: -0.2,
  },
  title: {},
  titleUnderline: {
    width: 90,
    height: spacing[2],
    borderRadius: borderRadius.sm,
    marginTop: -spacing[1],
  },
});
