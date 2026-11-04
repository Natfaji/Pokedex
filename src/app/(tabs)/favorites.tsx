import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PokemonCard } from "@/components/pokemon-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useApp } from "@/lib/app-provider";

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, isFavorite, toggleFavorite } = useApp();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four },
        ]}
        data={favorites}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <ThemedText type="subtitle" style={styles.title}>
            {t("favorites")}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            favorite={isFavorite(item.name)}
            favoriteLabel={t("removeFavorite")}
            onToggleFavorite={() => toggleFavorite(item)}
            onPress={() => router.push(`/pokemon/${item.name}` as Href)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText themeColor="textSecondary">
              {t("noFavorites")}
            </ThemedText>
          </View>
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
  title: {
    marginBottom: Spacing.four,
  },
  row: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.six,
  },
});
