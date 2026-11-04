import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PokemonCard } from "@/components/pokemon-card";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { searchPokemon, type PokemonSummary } from "@/lib/pokeapi";

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { query: queryParam } = useLocalSearchParams<{ query?: string }>();
  const { t } = useTranslation();
  const [query, setQuery] = useState(
    typeof queryParam === "string" ? queryParam : "",
  );
  const [results, setResults] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const currentQuery = typeof queryParam === "string" ? queryParam : "";
    if (!currentQuery) {
      return;
    }
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setError(false);
        setLoading(true);
      }
    });
    searchPokemon(currentQuery)
      .then((nextResults) => {
        if (active) setResults(nextResults);
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
  }, [queryParam]);

  const submitSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.replace(
        `/search?query=${encodeURIComponent(trimmedQuery)}` as Href,
      );
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four },
        ]}
        data={results}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle">{t("searchResults")}</ThemedText>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onSubmit={submitSearch}
              placeholder={t("searchPlaceholder")}
              submitLabel={t("search")}
            />
            <ThemedText themeColor="textSecondary">{query}</ThemedText>
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
          ) : (
            <View style={styles.state}>
              <ThemedText themeColor="textSecondary">
                {t("noResults")}
              </ThemedText>
            </View>
          )
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
