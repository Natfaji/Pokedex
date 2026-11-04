import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PokemonCard } from "@/components/pokemon-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { getPokemonByType, type PokemonSummary } from "@/lib/pokeapi";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function PokemonTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type: typeParam } = useLocalSearchParams<{ type: string }>();
  const type = typeof typeParam === "string" ? typeParam : "";
  const { t } = useTranslation();
  const [pokemon, setPokemon] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!type) return;
    let active = true;
    getPokemonByType(type)
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
  }, [type]);

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
            <ThemedText type="subtitle">{formatName(type)}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {t("typePokemon")}
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            onPress={() => router.push(`/pokemon/${item.name}` as Href)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.state}>
            {loading ? (
              <>
                <ActivityIndicator
                  accessibilityLabel={t("loading")}
                  color={Palette.accent}
                />
                <ThemedText themeColor="textSecondary">
                  {t("loading")}
                </ThemedText>
              </>
            ) : error ? (
              <ThemedText>{t("error")}</ThemedText>
            ) : (
              <ThemedText themeColor="textSecondary">
                {t("noTypePokemon")}
              </ThemedText>
            )}
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
  header: {
    gap: Spacing.two,
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
