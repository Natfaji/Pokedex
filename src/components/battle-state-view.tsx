import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";

export function StateView({
  message,
  action,
  onAction,
}: {
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <ThemedView style={styles.state}>
      <ThemedText type="subtitle">{message}</ThemedText>
      {action && onAction && (
        <Pressable
          onPress={onAction}
          style={styles.button}
          accessibilityRole="button"
        >
          <ThemedText style={styles.buttonText}>{action}</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.three,
  },
  button: {
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: Palette.accent,
  },
  buttonText: { color: Palette.white, fontWeight: "800" },
});
