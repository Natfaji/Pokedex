import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import PokemonList from "@/components/pokemon-list";
import { SearchBarWithResults } from "@/components/search-bar-with-results";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  useFavoritesActions,
  useFavoritesState,
} from "@/lib/favorites-provider";
import { usePokemonList } from "@/lib/queries";
import { useIsFetching } from "@tanstack/react-query";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const isFetching = useIsFetching();
  const { toggleFavorite } = useFavoritesActions();
  const { favoriteIds } = useFavoritesState();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePokemonList();
  const pokemon = data?.pages.flatMap((page) => page.pokemon) ?? [];

  const submitSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 3) {
      router.push({
        pathname: "/search",
        params: { query: trimmedQuery },
      });
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <PokemonList
        data={pokemon}
        header={
          <View style={styles.header}>
            <ThemedText type="title">{t("appName")}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {t("browseDescription")}
            </ThemedText>
            <LanguageSwitcher />
            <SearchBarWithResults
              value={query}
              onChangeText={setQuery}
              onSubmit={submitSearch}
              onSelect={(name) =>
                router.push({
                  pathname: "/pokemon/[name]",
                  params: { name },
                })
              }
              placeholder={t("searchPlaceholder")}
              submitLabel={t("search")}
              seeAllLabel={t("seeAll")}
              onSeeAll={submitSearch}
            />
            <ThemedText type="subtitle">{t("home")}</ThemedText>
          </View>
        }
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onLoadMore={() => {
          if (hasNextPage && !isFetching) {
            void fetchNextPage();
          }
        }}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
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
