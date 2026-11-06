import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import PokemonList from "@/components/pokemon-list";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { usePokemonSearch } from "@/lib/queries";

export default function SearchScreen() {
  const router = useRouter();
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
      <PokemonList
        data={results}
        header={
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
        isLoading={isLoading}
        isError={isError}
        emptyMessage={t("noResults")}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
