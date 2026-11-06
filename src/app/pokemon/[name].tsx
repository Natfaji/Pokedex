import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
import { getPokemonTypeColor, Palette, Spacing } from "@/constants/theme";
import {
  useFavoritesActions,
  useFavoritesState,
} from "@/lib/favorites-provider";
import { usePokemonDetails } from "@/lib/queries";
import { Image } from "expo-image";

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
  const { toggleFavorite } = useFavoritesActions();
  const { favoriteIds } = useFavoritesState();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<
    "about" | "stats" | "evolutions"
  >("about");
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

  const favorite = favoriteIds.has(pokemon.id);
  const pokemonUrl = Linking.createURL(`/pokemon/${pokemon.name}`);
  const copyPokemonLink = async () => {
    try {
      await Clipboard.setStringAsync(pokemonUrl);
      Alert.alert(t("linkCopied"));
    } catch {
      Alert.alert(t("copyError"));
    }
  };
  const handleShare = async () => {
    const canUseWebShare =
      Platform.OS !== "web" ||
      (typeof navigator !== "undefined" &&
        "share" in navigator &&
        typeof navigator.share === "function");

    if (!canUseWebShare) {
      await copyPokemonLink();
      return;
    }

    try {
      await Share.share({
        message: `${formatName(pokemon.name)} #${pokemon.id} - ${pokemonUrl}`,
        title: formatName(pokemon.name),
      });
    } catch {
      if (Platform.OS === "web") {
        await copyPokemonLink();
      } else {
        Alert.alert(t("shareError"));
      }
    }
  };

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
            source={{ uri: pokemon.image }}
            cachePolicy={"memory-disk"}
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
                  { backgroundColor: getPokemonTypeColor(type.name) },
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
              onPress={() => void handleShare()}
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                {t("share")}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionTabs}>
          {(
            [
              ["about", t("about")],
              ["stats", t("stats")],
              ["evolutions", t("evolutions")],
            ] as const
          ).map(([section, label]) => (
            <Pressable
              key={section}
              accessibilityRole="button"
              accessibilityState={{ selected: activeSection === section }}
              onPress={() => setActiveSection(section)}
              style={[
                styles.sectionTab,
                activeSection === section && styles.sectionTabActive,
              ]}
            >
              <ThemedText
                type="smallBold"
                style={activeSection === section && styles.sectionTabTextActive}
              >
                {label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {activeSection === "about" && (
          <DetailSection title={t("about")}>
            <ThemedText>{`#${pokemon.id} ${formatName(pokemon.name)}`}</ThemedText>
            <ThemedText>
              {t("abilities")}: {pokemon.abilities.map(formatName).join(", ")}
            </ThemedText>
            <ThemedText>
              {t("types")}:{" "}
              {pokemon.types.map((type) => formatName(type.name)).join(", ")}
            </ThemedText>
          </DetailSection>
        )}
        {activeSection === "stats" && (
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
        )}
        {activeSection === "evolutions" && (
          <DetailSection title={t("evolutions")}>
            <View style={styles.evolutionList}>
              {pokemon.evolutions.map((evolution) => (
                <PokemonCard key={evolution.name} pokemon={evolution} />
              ))}
            </View>
          </DetailSection>
        )}
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
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    marginHorizontal: Spacing.three,
  },
  sectionTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  sectionTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Palette.accent,
  },
  sectionTabTextActive: {
    color: Palette.accent,
  },
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
