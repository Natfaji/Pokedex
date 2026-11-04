import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { SearchBarWithResults } from "@/components/search-bar-with-results";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { usePokemonDetails } from "@/lib/queries";

function displayName(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CompareScreen() {
  const router = useRouter();
  const { first: firstParam } = useLocalSearchParams<{ first?: string }>();
  const { t } = useTranslation();
  const [first, setFirst] = useState(typeof firstParam === "string" ? firstParam : "");
  const [firstSearch, setFirstSearch] = useState(
    typeof firstParam === "string" ? firstParam : "",
  );
  const [second, setSecond] = useState("");
  const [secondSearch, setSecondSearch] = useState("");
  const firstQuery = usePokemonDetails(first.trim().toLowerCase());
  const secondQuery = usePokemonDetails(second.trim().toLowerCase());
  const firstStats = firstQuery.data?.stats ?? [];
  const secondStats = secondQuery.data?.stats ?? [];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <ThemedText type="linkPrimary">{t("back")}</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{t("compareTitle")}</ThemedText>
        <ThemedText themeColor="textSecondary">{t("choosePokemon")}</ThemedText>
        <View style={styles.nameRow}>
          <View style={styles.nameBox}>
            <ThemedText type="smallBold">{t("selectPokemon")}</ThemedText>
            <SearchBarWithResults
              value={firstSearch}
              onChangeText={(value) => {
                setFirst("");
                setFirstSearch(value);
              }}
              placeholder="pikachu"
              submitLabel={t("selectPokemon")}
              onSubmit={() => undefined}
              onSelect={(name) => {
                setFirst(name);
                setFirstSearch(name);
              }}
              showResults={!first}
            />
          </View>
          <View style={styles.nameBox}>
            <ThemedText type="smallBold">{t("selectPokemon")}</ThemedText>
            <SearchBarWithResults
              value={secondSearch}
              onChangeText={(value) => {
                setSecond("");
                setSecondSearch(value);
              }}
              placeholder="charizard"
              submitLabel={t("selectPokemon")}
              onSubmit={() => undefined}
              onSelect={(name) => {
                setSecond(name);
                setSecondSearch(name);
              }}
              showResults={!second}
            />
          </View>
        </View>
        {(firstQuery.isLoading || secondQuery.isLoading) && (
          <ActivityIndicator accessibilityLabel={t("loading")} color={Palette.accent} />
        )}
        {(firstQuery.isError || secondQuery.isError) && (
          <ThemedText>{t("error")}</ThemedText>
        )}
        {firstQuery.data && secondQuery.data && (
          <View style={styles.comparison}>
            <View style={styles.imageRow}>
              <Image
                source={firstQuery.data.image}
                contentFit="contain"
                style={styles.pokemonImage}
                accessibilityLabel={displayName(firstQuery.data.name)}
              />
              <Image
                source={secondQuery.data.image}
                contentFit="contain"
                style={styles.pokemonImage}
                accessibilityLabel={displayName(secondQuery.data.name)}
              />
            </View>
            <View style={styles.headerRow}>
              <ThemedText type="smallBold">{displayName(firstQuery.data.name)}</ThemedText>
              <ThemedText type="smallBold">{t("stronger")}</ThemedText>
              <ThemedText type="smallBold">{displayName(secondQuery.data.name)}</ThemedText>
            </View>
            {firstStats.map((stat, index) => {
              const other = secondStats[index];
              const winner = stat.value === other.value ? "-" : stat.value > other.value
                ? displayName(firstQuery.data.name)
                : displayName(secondQuery.data.name);
              return (
                <View key={stat.name} style={styles.statRow}>
                  <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                  <View style={styles.statName}>
                    <ThemedText type="smallBold">{displayName(stat.name)}</ThemedText>
                    <ThemedText themeColor="textSecondary" type="small">{winner}</ThemedText>
                  </View>
                  <ThemedText style={styles.statValue}>{other.value}</ThemedText>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
    paddingTop: Spacing.six,
  },
  nameRow: { flexDirection: "row", gap: Spacing.two },
  nameBox: { flex: 1, gap: Spacing.one },
  comparison: { gap: Spacing.two, marginTop: Spacing.three },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pokemonImage: {
    width: 140,
    height: 140,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: Spacing.two,
    backgroundColor: Palette.barTrack,
  },
  statName: { flex: 1, alignItems: "center" },
  statValue: { width: 42, textAlign: "center", fontWeight: "700" },
});
