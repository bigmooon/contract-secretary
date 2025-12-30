/**
 * ContactMemo Component
 * Card 4: 연락처 & 메모
 * Displays owner/tenant contacts (clickable for calling) and notes
 */

import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Text, borderRadius, spacing, useTheme } from '@/design-system';
import type { Contact, Property } from '@/types/property';
import { DetailCard } from './DetailCard';

interface ContactMemoProps {
  property: Property;
}

interface ContactItemProps {
  label: string;
  contact: Contact;
}

function ContactItem({ label, contact }: ContactItemProps) {
  const theme = useTheme();
  const isDark = theme.scheme === 'dark';

  const handleCall = () => {
    const phoneNumber = contact.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.contactRow}>
      <Text
        variant="body"
        style={styles.contactLabel}
        lightColor={isDark ? undefined : '#6A7282'}
        darkColor={isDark ? '#9BA7B4' : undefined}
      >
        {label}
      </Text>
      <Pressable onPress={handleCall} style={styles.contactButton}>
        <Text variant="bodyMedium" style={{ color: theme.colors.blue }}>
          {contact.name ? `${contact.name} ` : ''}
          {contact.phone}
        </Text>
      </Pressable>
    </View>
  );
}

export function ContactMemo({ property }: ContactMemoProps) {
  const theme = useTheme();
  const isDark = theme.scheme === 'dark';

  return (
    <DetailCard title="연락처 & 메모">
      {property.ownerContacts.map((contact, index) => (
        <ContactItem
          key={`owner-${index}`}
          label={property.ownerContacts.length > 1 ? `주인 ${index + 1}` : '주인'}
          contact={contact}
        />
      ))}

      {property.tenantContacts && property.tenantContacts.length > 0 && (
        <>
          {property.tenantContacts.map((contact, index) => (
            <ContactItem
              key={`tenant-${index}`}
              label={
                property.tenantContacts!.length > 1
                  ? `세입자 ${index + 1}`
                  : '세입자'
              }
              contact={contact}
            />
          ))}
        </>
      )}

      {property.notes && (
        <View style={styles.notesContainer}>
          <Text
            variant="body"
            lightColor={isDark ? undefined : '#6A7282'}
            darkColor={isDark ? '#9BA7B4' : undefined}
          >
            메모
          </Text>
          <View
            style={[
              styles.notesBox,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text variant="body">{property.notes}</Text>
          </View>
        </View>
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  contactLabel: {
    flex: 1,
  },
  contactButton: {
    flex: 2,
    alignItems: 'flex-end',
  },
  notesContainer: {
    marginTop: spacing[2],
  },
  notesBox: {
    marginTop: spacing[2],
    padding: spacing[3],
    borderRadius: borderRadius.md,
  },
});
