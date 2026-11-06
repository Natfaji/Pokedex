import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import PokemonList from "@/components/pokemon-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  useFavoritesActions,
  useFavoritesState,
} from "@/lib/favorites-provider";

export default function FavoritesScreen() {
  const { favorites, favoriteIds, error } = useFavoritesState();
  const { toggleFavorite } = useFavoritesActions();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <PokemonList
        data={favorites}
        header={
          <ThemedText type="subtitle" style={styles.title}>
            {t("favorites")}
          </ThemedText>
        }
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        emptyMessage={t("noFavorites")}
      />
      {error && <ThemedText>{error}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: {
    marginBottom: Spacing.four,
  },
});
