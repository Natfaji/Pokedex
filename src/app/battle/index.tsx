import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { getPokemonNameIndex } from "@/lib/pokeapi";
import { useBattlePokemon, usePokemonNameSearch } from "@/lib/queries";

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
  const search = usePokemonNameSearch(value);
  const details = useBattlePokemon(selected);
  return (
    <View style={styles.picker}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholder={t("battleSearchPlaceholder")}
        placeholderTextColor={Palette.placeholder}
        value={value}
        onChangeText={onChange}
        style={styles.input}
        autoCapitalize="none"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("battleRandom")}
        onPress={onRandom}
        style={styles.secondaryButton}
      >
        <ThemedText style={styles.secondaryButtonText}>
          {t("battleRandom")}
        </ThemedText>
      </Pressable>
      {search.isLoading && value.trim().length >= 3 && (
        <ThemedText themeColor="textSecondary">{t("loading")}</ThemedText>
      )}
      {search.isError && (
        <ThemedText style={styles.error}>{t("error")}</ThemedText>
      )}
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
      {search.data?.slice(0, 5).map((pokemon) => (
        <Pressable
          key={pokemon.name}
          accessibilityRole="button"
          accessibilityLabel={pokemon.name}
          onPress={() => {
            onSelect(pokemon.name);
            onChange(pokemon.name);
          }}
          style={styles.result}
        >
          <ThemedText>{pokemon.name}</ThemedText>
        </Pressable>
      ))}
      {!!selected && details.data && (
        <View style={styles.selected}>
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
        </View>
      )}
    </View>
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
    backgroundColor: "#E8EEF8",
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    padding: Spacing.two,
    backgroundColor: Palette.white,
    color: "#172033",
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: "#D6E4FF",
  },
  secondaryButtonText: { color: Palette.accent, fontWeight: "700" },
  result: {
    padding: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  selected: {
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: Palette.accent,
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
