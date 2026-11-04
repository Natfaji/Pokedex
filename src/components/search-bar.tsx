import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  submitLabel,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.inputFrame}>
        <TextInput
          accessibilityLabel={placeholder}
          autoCapitalize="none"
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={Palette.placeholder}
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
      </ThemedView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        onPress={onSubmit}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <ThemedText style={styles.buttonText}>{submitLabel}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  inputFrame: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 10,
  },
  input: {
    color: Palette.accentDark,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  button: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    backgroundColor: Palette.accent,
  },
  buttonText: {
    color: Palette.white,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
