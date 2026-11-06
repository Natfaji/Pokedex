import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PokemonTypeCard } from "@/components/pokemon-type-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { usePokemonTypes } from "@/lib/queries";

export default function TypesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const {
    data: types = [],
    isLoading: loading,
    isError: error,
  } = usePokemonTypes();

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four },
        ]}
        data={types}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <ThemedText type="subtitle" style={styles.title}>
            {t("typeOverview")}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <PokemonTypeCard
            type={item}
            onPress={() => router.push(`/types/${item.name}` as Href)}
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
  title: {
    marginBottom: Spacing.four,
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
