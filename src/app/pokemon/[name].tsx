import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PokemonCard from "@/components/pokemon-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { useApp } from "@/lib/app-provider";
import { usePokemonDetails } from "@/lib/queries";

function formatName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PokemonDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name: nameParam } = useLocalSearchParams<{ name: string }>();
  const name = typeof nameParam === "string" ? nameParam : "";
  const { isFavorite, toggleFavorite } = useApp();
  const { t } = useTranslation();
  const { data: pokemon, isLoading, isError } = usePokemonDetails(name);

  if (isLoading) {
    return (
      <ThemedView style={styles.state}>
        <ActivityIndicator
          accessibilityLabel={t("loading")}
          color={Palette.accent}
        />
        <ThemedText themeColor="textSecondary">{t("loading")}</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !pokemon) {
    return (
      <ThemedView style={styles.state}>
        <ThemedText>{t("error")}</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.button}
        >
          <ThemedText style={styles.buttonText}>{t("back")}</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const favorite = isFavorite(pokemon.name);
  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
      >
        <View
          style={[styles.header, { paddingTop: insets.top + Spacing.three }]}
        >
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <ThemedText type="linkPrimary">{t("back")}</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.name}>
            {formatName(pokemon.name)}
          </ThemedText>
          <Image
            source={pokemon.image}
            contentFit="contain"
            style={styles.image}
          />
          <View style={styles.types}>
            {pokemon.types.map((type) => (
              <Pressable
                key={type.name}
                accessibilityRole="button"
                accessibilityLabel={formatName(type.name)}
                onPress={() => router.push(`/types/${type.name}` as Href)}
                style={({ pressed }) => [
                  styles.typePill,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText style={styles.typePillText}>
                  {formatName(type.name)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorite ? t("removeFavorite") : t("addFavorite")
            }
            onPress={() => toggleFavorite(pokemon)}
            style={styles.favoriteButton}
          >
            <ThemedText style={styles.favoriteText}>
              {favorite ? "★" : "☆"}{" "}
            </ThemedText>
            <ThemedText style={styles.favoriteText}>
              {favorite ? t("removeFavorite") : t("addFavorite")}
            </ThemedText>
          </Pressable>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("compare")}
              onPress={() =>
                router.push(`/compare?first=${pokemon.name}` as Href)
              }
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                {t("compare")}
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("share")}
              onPress={() =>
                void Share.share({
                  message: `${formatName(pokemon.name)} #${pokemon.id} - ${pokemon.image}`,
                  title: formatName(pokemon.name),
                })
              }
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                {t("share")}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <DetailSection title={t("abilities")}>
          <ThemedText>
            {pokemon.abilities.map(formatName).join(", ")}
          </ThemedText>
        </DetailSection>
        <DetailSection title={t("stats")}>
          {pokemon.stats.map((stat) => (
            <View key={stat.name} style={styles.statRow}>
              <ThemedText style={styles.statName}>
                {formatName(stat.name)}
              </ThemedText>
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { width: `${Math.min(stat.value, 100)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </DetailSection>
        <DetailSection title={t("evolutions")}>
          <View style={styles.evolutionList}>
            {pokemon.evolutions.map((evolution) => (
              <PokemonCard
                key={evolution.name}
                pokemon={evolution}
                onPress={() =>
                  router.push(`/pokemon/${evolution.name}` as Href)
                }
              />
            ))}
          </View>
        </DetailSection>
      </ScrollView>
    </ThemedView>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  header: {
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  name: { textAlign: "center" },
  image: { width: 220, height: 220 },
  types: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  typePill: {
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.accent,
  },
  typePillText: {
    color: Palette.white,
  },
  pressed: {
    opacity: 0.72,
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.accentDark,
  },
  favoriteText: { color: Palette.white, fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Palette.accent,
  },
  secondaryButtonText: {
    color: Palette.accent,
    fontWeight: "700",
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.accent,
  },
  buttonText: { color: Palette.white, fontWeight: "700" },
  section: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  sectionTitle: { fontSize: 24, lineHeight: 30 },
  statRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  statName: { width: 105 },
  statValue: { width: 32, fontWeight: "700" },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.barTrack,
    overflow: "hidden",
  },
  bar: { height: "100%", backgroundColor: Palette.accent },
  evolutionList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.three },
});
