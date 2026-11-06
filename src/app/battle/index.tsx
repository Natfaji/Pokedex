import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { SearchBarWithResults } from "@/components/search-bar-with-results";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { getPokemonNameIndex } from "@/lib/pokeapi";
import { useBattlePokemon } from "@/lib/queries";

function Picker({
  label,
  value,
  onChange,
  selected,
  onSelect,
  onRandom,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  selected: string;
  onSelect: (name: string) => void;
  onRandom: () => void;
}) {
  const { t } = useTranslation();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const details = useBattlePokemon(selected);
  return (
    <ThemedView
      type="card"
      style={[styles.picker, showSearchResults && styles.pickerActive]}
    >
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        style={[styles.searchRow, showSearchResults && styles.searchRowActive]}
      >
        <View style={styles.searchControl}>
          <SearchBarWithResults
            value={value}
            onChangeText={(text) => {
              setShowSearchResults(true);
              onChange(text);
            }}
            onSubmit={() => undefined}
            onSelect={(name) => {
              setShowSearchResults(false);
              onSelect(name);
              onChange(name);
            }}
            placeholder={t("battleSearchPlaceholder")}
            submitLabel={t("search")}
            showSubmitButton={false}
            showResults={showSearchResults}
            onFocus={() => setShowSearchResults(true)}
            onBlur={() => {
              setTimeout(() => setShowSearchResults(false), 100);
            }}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("battleRandom")}
          onPress={() => {
            setShowSearchResults(false);
            onRandom();
          }}
          style={styles.secondaryButton}
        >
          <ThemedText style={styles.secondaryButtonText}>
            {t("battleRandom")}
          </ThemedText>
        </Pressable>
      </View>
      {details.isLoading && !!selected && (
        <ThemedText themeColor="textSecondary">{t("battleLoading")}</ThemedText>
      )}
      {details.isError && !!selected && (
        <Pressable
          onPress={() => void details.refetch()}
          accessibilityRole="button"
        >
          <ThemedText style={styles.error}>
            {t("error")} · {t("tryAgain")}
          </ThemedText>
        </Pressable>
      )}
      {!!selected && details.data && (
        <ThemedView type="card" style={styles.selected}>
          <Image
            accessibilityLabel={details.data.name}
            source={{ uri: details.data.image }}
            cachePolicy="memory-disk"
            style={styles.selectedImage}
          />
          <ThemedText type="subtitle" style={styles.selectedName}>
            {details.data.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {t("battleLevel")} 50 ·{" "}
            {details.data.types.map(({ name }) => name).join(" / ")}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

export default function BattleSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [player, setPlayer] = useState("");
  const [opponent, setOpponent] = useState("");
  const [playerQuery, setPlayerQuery] = useState("");
  const [opponentQuery, setOpponentQuery] = useState("");
  const { width } = useWindowDimensions();
  const names = useQuery({
    queryKey: ["battle-random-names"],
    queryFn: getPokemonNameIndex,
  });

  const randomName = () => {
    const list = names.data ?? [];
    return list.length
      ? list[Math.floor(Math.random() * list.length)].name
      : "";
  };
  const canStart = player.length > 0 && opponent.length > 0;
  const isLargeScreen = width >= 700;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t("battleTitle")}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {t("battleDescription")}
        </ThemedText>
        {names.isError && (
          <Pressable
            onPress={() => void names.refetch()}
            accessibilityRole="button"
          >
            <ThemedText style={styles.error}>
              {t("error")} · {t("tryAgain")}
            </ThemedText>
          </Pressable>
        )}
        <View style={isLargeScreen ? styles.pickersRow : styles.pickersColumn}>
          <View style={isLargeScreen && styles.pickerColumn}>
            <Picker
              label={t("battlePlayer")}
              value={playerQuery}
              onChange={setPlayerQuery}
              selected={player}
              onSelect={setPlayer}
              onRandom={() => {
                const name = randomName();
                if (name) {
                  setPlayer(name);
                  setPlayerQuery(name);
                }
              }}
            />
          </View>
          <View style={isLargeScreen && styles.pickerColumn}>
            <Picker
              label={t("battleOpponent")}
              value={opponentQuery}
              onChange={setOpponentQuery}
              selected={opponent}
              onSelect={setOpponent}
              onRandom={() => {
                const name = randomName();
                if (name) {
                  setOpponent(name);
                  setOpponentQuery(name);
                }
              }}
            />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("battleStart")}
          disabled={!canStart}
          onPress={() =>
            router.push({
              pathname: "/battle/fight",
              params: { player, opponent },
            })
          }
          style={[styles.startButton, !canStart && styles.disabled]}
        >
          <ThemedText style={styles.startText}>{t("battleStart")}</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  title: { color: Palette.accent },
  pickersRow: {
    flexDirection: "row",
    gap: Spacing.three,
    alignItems: "flex-start",
  },
  pickersColumn: { gap: Spacing.three },
  pickerColumn: { flex: 1 },
  picker: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 20,
    overflow: "visible",
  },
  pickerActive: {
    zIndex: 100,
    elevation: 100,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    zIndex: 10,
    overflow: "visible",
  },
  searchRowActive: {
    zIndex: 100,
    elevation: 100,
  },
  searchControl: {
    flex: 1,
    zIndex: 100,
    elevation: 100,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: "#D6E4FF",
  },
  secondaryButtonText: { color: Palette.accent, fontWeight: "700" },
  selected: {
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 14,
  },
  selectedImage: { width: 140, height: 140 },
  selectedName: { color: Palette.white, fontSize: 24, lineHeight: 30 },
  error: { color: "#B42318" },
  startButton: {
    alignItems: "center",
    borderRadius: 14,
    padding: Spacing.three,
    backgroundColor: Palette.accent,
  },
  startText: { color: Palette.white, fontWeight: "700" },
  disabled: { opacity: 0.45 },
});
