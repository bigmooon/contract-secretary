import {
  Text as ThemedText,
  View as ThemedView,
  colors,
  shadows,
  useThemeColor,
} from '@/design-system';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

type HeaderProps = PropsWithChildren<{
  title: string;
  date?: boolean;
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

export function Header({ title, date = false }: HeaderProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');

  const today = formatKoreanDate(new Date());

  return (
    <View style={[styles.headerContainer, { backgroundColor }, shadows.card]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          {date && (
            <View style={styles.dateRow}>
              <ThemedView
                lightColor={colors.light.background}
                darkColor={colors.dark.background}
                style={styles.iconContainer}
              >
                <IconSymbol
                  name="calendar"
                  size={18}
                  color={colors.light.textSecondary}
                />
              </ThemedView>
              <ThemedText
                variant="bodyMedium"
                style={styles.dateText}
                lightColor={colors.light.textPrimary}
                darkColor={colors.dark.textPrimary}
              >
                {today}
              </ThemedText>
            </View>
          )}
          <ThemedText variant="h1" style={styles.title}>
            {title}
          </ThemedText>
          <View
            style={[styles.titleUnderline, { backgroundColor: primaryColor }]}
          />
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
    paddingTop: 20,
    paddingBottom: 25,
    gap: 15,
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -20,
  },
  iconContainer: {
    borderRadius: 15,
    padding: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 36,
    lineHeight: 36,
  },
  titleUnderline: {
    width: 90,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
});
