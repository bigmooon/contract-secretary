import {
  Button,
  Text,
  View as ThemedView,
  borderRadius,
  shadows,
  spacing,
  useTheme,
} from '@/design-system';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}
        onPress={onCancel}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView
            style={[styles.dialog, shadows.modal, { backgroundColor: theme.colors.card }]}
          >
            <Text variant="h4" style={styles.title}>
              {title}
            </Text>
            <Text variant="body" style={styles.message}>
              {message}
            </Text>
            <View style={styles.buttons}>
              <Button
                variant="outline"
                onPress={onCancel}
                style={styles.button}
              >
                {cancelText}
              </Button>
              <Button
                variant="primary"
                onPress={onConfirm}
                style={{
                  flex: 1,
                  ...(isDestructive && { backgroundColor: theme.colors.red }),
                }}
              >
                {confirmText}
              </Button>
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing[5],
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  button: {
    flex: 1,
  },
});
