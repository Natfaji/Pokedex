import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PokemonCard } from "@/components/pokemon-card";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { useApp } from "@/lib/app-provider";
import { getPokemonList, type PokemonSummary } from "@/lib/pokeapi";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useApp();
  const { t } = useTranslation();
  const [pokemon, setPokemon] = useState<PokemonSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getPokemonList()
      .then((result) => {
        if (active) setPokemon(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?query=${encodeURIComponent(trimmedQuery)}` as Href);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four },
        ]}
        data={pokemon}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">{t("appName")}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {t("browseDescription")}
            </ThemedText>
            <View style={styles.languageRow}>
              <ThemedText type="smallBold">{t("language")}</ThemedText>
              <View style={styles.languageOptions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === "en" }}
                  onPress={() => setLanguage("en")}
                  style={[
                    styles.languageButton,
                    language === "en" && styles.selectedLanguage,
                  ]}
                >
                  <ThemedText
                    style={language === "en" && styles.selectedLanguageText}
                  >
                    {t("english")}
                  </ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === "nl" }}
                  onPress={() => setLanguage("nl")}
                  style={[
                    styles.languageButton,
                    language === "nl" && styles.selectedLanguage,
                  ]}
                >
                  <ThemedText
                    style={language === "nl" && styles.selectedLanguageText}
                  >
                    {t("dutch")}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmit={submitSearch}
              placeholder={t("searchPlaceholder")}
              submitLabel={t("search")}
            />
            <ThemedText type="subtitle">{t("home")}</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            onPress={() => router.push(`/pokemon/${item.name}` as Href)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.state}>
              <ActivityIndicator
                accessibilityLabel={t("loading")}
                color={Palette.accent}
              />
              <ThemedText themeColor="textSecondary">{t("loading")}</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.state}>
              <ThemedText>{t("error")}</ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
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
  row: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  state: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
});
