import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import PokemonList from "@/components/pokemon-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
  useFavoritesActions,
  useFavoritesState,
} from "@/lib/favorites-provider";
import { usePokemonByType } from "@/lib/queries";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function PokemonTypeScreen() {
  const { type: typeParam } = useLocalSearchParams<{ type: string }>();
  const type = typeof typeParam === "string" ? typeParam : "";
  const { t } = useTranslation();
  const { data: pokemon = [], isLoading, isError } = usePokemonByType(type);
  const { toggleFavorite } = useFavoritesActions();
  const { favoriteIds } = useFavoritesState();

  return (
    <ThemedView style={styles.screen}>
      <PokemonList
        data={pokemon}
        header={
          <View style={styles.header}>
            <ThemedText type="subtitle">{formatName(type)}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {t("typePokemon")}
            </ThemedText>
          </View>
        }
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        isLoading={isLoading}
        isError={isError || !type}
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
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  row: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
});
