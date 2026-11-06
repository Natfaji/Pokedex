import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  showSubmitButton?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  submitLabel,
  showSubmitButton = true,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.inputFrame}>
        <TextInput
          accessibilityLabel={placeholder}
          autoCapitalize="none"
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={Palette.placeholder}
          returnKeyType="search"
          style={[styles.input, { color: theme.text }]}
          value={value}
        />
      </ThemedView>
      {showSubmitButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          onPress={onSubmit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <ThemedText style={styles.buttonText}>{submitLabel}</ThemedText>
        </Pressable>
      )}
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
    borderWidth: 3,
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
