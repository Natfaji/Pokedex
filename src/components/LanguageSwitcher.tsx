import { Palette, Spacing } from "@/constants/theme";
import { useApp } from "@/lib/app-provider";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

const LANGUAGES = [
  { code: "en", label: "english" },
  { code: "nl", label: "dutch" },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useApp();
  const { t } = useTranslation();
  return (
    <View style={styles.languageRow}>
      <ThemedText type="smallBold">{t("language")}</ThemedText>
      <View style={styles.languageOptions}>
        {LANGUAGES.map(({ code, label }) => {
          const selected = language === code;
          return (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              hitSlop={8}
              onPress={() => setLanguage(code)}
              style={[
                styles.languageButton,
                selected && styles.selectedLanguage,
              ]}
            >
              <ThemedText style={selected && styles.selectedLanguageText}>
                {t(label)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageOptions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  languageButton: {
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  selectedLanguage: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  selectedLanguageText: {
    color: Palette.white,
    fontWeight: "700",
  },
});
