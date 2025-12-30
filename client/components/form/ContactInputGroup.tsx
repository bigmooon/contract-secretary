/**
 * ContactInputGroup Component
 * Group of inputs for adding/removing contacts (owner or tenant)
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import {
  Text,
  borderRadius,
  spacing,
  useTheme,
} from '@/design-system';
import type { Contact } from '@/types/property';

interface ContactInputGroupProps {
  label: string;
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

export function ContactInputGroup({
  label,
  contacts,
  onChange,
}: ContactInputGroupProps) {
  const theme = useTheme();
  const isDark = theme.scheme === 'dark';

  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onChange(newContacts);
  };

  const handleAddContact = () => {
    onChange([...contacts, { phone: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    if (contacts.length > 1) {
      const newContacts = contacts.filter((_, i) => i !== index);
      onChange(newContacts);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      {contacts.map((contact, index) => (
        <View key={index} style={styles.contactRow}>
          <TextInput
            style={[
              styles.input,
              styles.nameInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="이름 (선택)"
            placeholderTextColor={isDark ? '#6A7282' : '#9BA7B4'}
            value={contact.name || ''}
            onChangeText={(value) => handleContactChange(index, 'name', value)}
          />
          <TextInput
            style={[
              styles.input,
              styles.phoneInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="전화번호"
            placeholderTextColor={isDark ? '#6A7282' : '#9BA7B4'}
            value={contact.phone}
            onChangeText={(value) => handleContactChange(index, 'phone', value)}
            keyboardType="phone-pad"
          />
          {contacts.length > 1 && (
            <Pressable
              onPress={() => handleRemoveContact(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={24} color={theme.colors.red} />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable
        onPress={handleAddContact}
        style={[styles.addButton, { borderColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={20} color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
          연락처 추가
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: 16,
  },
  nameInput: {
    flex: 1,
  },
  phoneInput: {
    flex: 2,
  },
  removeButton: {
    padding: spacing[1],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
  },
});
