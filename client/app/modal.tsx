import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text as ThemedText, View as ThemedView } from '@/design-system';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="h1">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText variant="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
