import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import PokemonCard from "@/components/pokemon-card";
import { SearchBarWithResults } from "@/components/search-bar-with-results";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { useApp } from "@/lib/app-provider";
import { usePokemonList } from "@/lib/queries";
import { useIsFetching } from "@tanstack/react-query";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const isFetching = useIsFetching();
  const { isFavorite, toggleFavorite } = useApp();

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

  const { width } = useWindowDimensions();
  const NUM_COLUMNS = width >= 1200 ? 4 : width >= 768 ? 3 : 2;

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four },
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        data={pokemon}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
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
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            favorite={isFavorite(item.name)}
            onToggleFavorite={() => toggleFavorite(item)}
            onPress={() =>
              router.push({
                pathname: "/pokemon/[name]",
                params: { name: item.name },
              })
            }
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetching) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
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
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              accessibilityLabel={t("loading")}
              color={Palette.accent}
            />
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
