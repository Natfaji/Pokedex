import { StyleSheet, View } from "react-native";

import { AttackPopup, DamageImage } from "@/components/battle-animations";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { calculateMaxHp, type BattleSide } from "@/lib/battle-engine";
import type { BattlePokemon } from "@/lib/pokeapi";
import { ThemedView } from "./themed-view";

export type AttackPopupData = {
  side: BattleSide;
  text: string;
  kind: "damage" | "miss" | "critical";
};

export function BattleCard({
  pokemon,
  hp,
  damageVersion,
  popup,
}: {
  pokemon: BattlePokemon;
  hp: number;
  damageVersion: number;
  popup: AttackPopupData | null;
}) {
  const maxHp = calculateMaxHp(pokemon);
  const theme = useTheme();
  const hpPercentage = hp / maxHp;
  const hpColor =
    hpPercentage > 0.5
      ? theme.hpHigh
      : hpPercentage > 0.2
        ? theme.hpMid
        : theme.hpLow;

  return (
    <ThemedView type="card" style={styles.card}>
      <View style={styles.imageContainer}>
        <DamageImage
          image={pokemon.image}
          name={pokemon.name}
          damageVersion={damageVersion}
        />
        {popup && <AttackPopup text={popup.text} kind={popup.kind} />}
      </View>
      <View style={styles.cardText}>
        <ThemedText type="subtitle" style={styles.cardName}>
          {pokemon.name}
        </ThemedText>
        <ThemedText style={styles.hp}>
          {hp} / {maxHp} HP
        </ThemedText>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { backgroundColor: hpColor },
              { width: `${Math.max(0, (hp / maxHp) * 100)}%` },
            ]}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 3,
  },
  imageContainer: {
    position: "relative",
    width: 110,
    height: 110,
  },
  cardText: {
    flex: 1,
    gap: Spacing.one,
  },
  cardName: {
    fontSize: 25,
    lineHeight: 32,
  },
  hp: {
    fontWeight: "700",
  },
  track: {
    height: 12,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#CBD5E1",
  },
  fill: {
    height: "100%",
    borderRadius: 10,
  },
});
