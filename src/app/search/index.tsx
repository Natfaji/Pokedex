import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PokemonCard from "@/components/pokemon-card";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { usePokemonSearch } from "@/lib/queries";

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { query: queryParam } = useLocalSearchParams<{ query?: string }>();
  const { t } = useTranslation();
  const [query, setQuery] = useState(
    typeof queryParam === "string" ? queryParam : "",
  );
  const { data: results = [], isLoading, isError } = usePokemonSearch(query);

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
          </View>
        }
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            onPress={() => router.push(`/pokemon/${item.name}` as Href)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator
                accessibilityLabel={t("loading")}
                color={Palette.accent}
              />
              <ThemedText themeColor="textSecondary">{t("loading")}</ThemedText>
            </View>
          ) : isError ? (
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
