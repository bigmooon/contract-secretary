import {
  DDayBadge,
  PropertyTypeBadge,
  Text,
  View as ThemedView,
  borderRadius,
  colors,
  shadows,
  spacing,
  useTheme,
} from '@/design-system';
import {
  type Property,
  calculateDaysRemaining,
  formatPrice,
  getPropertyAddress,
} from '@/types/property';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

interface CardProps {
  property: Property;
}

export function Card({ property }: CardProps) {
  const theme = useTheme();
  const router = useRouter();

  const address = getPropertyAddress(property);
  const daysRemaining = calculateDaysRemaining(property.expirationDate);

  const getPriceText = () => {
    if (property.type === 'wolse' && property.monthlyRent) {
      return `${formatPrice(property.deposit)} / ${formatPrice(
        property.monthlyRent
      )}`;
    }
    return formatPrice(property.deposit);
  };

  const handlePress = () => {
    router.push(`/property/${property.id}` as any);
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView
        style={[
          styles.card,
          shadows.card,
          {
            borderRadius: borderRadius.lg,
            padding: spacing[4],
          },
        ]}
        lightColor={colors.light.card}
        darkColor={colors.dark.card}
      >
        <View style={styles.cardHeader}>
          <PropertyTypeBadge type={property.type} size="medium" />
          <Text
            variant="bodySemiBold"
            style={styles.cardTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {address}
          </Text>
          {daysRemaining !== null && (
            <DDayBadge daysRemaining={daysRemaining} size="medium" />
          )}
        </View>
        <View
          style={[
            styles.cardContent,
            {
              marginTop: spacing[3],
              padding: spacing[3],
              borderRadius: borderRadius.md,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Text variant="bodyMedium">{getPriceText()}</Text>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    textAlign: 'left',
    marginHorizontal: spacing[2],
  },
  cardContent: {},
});
