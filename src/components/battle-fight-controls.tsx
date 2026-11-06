import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";
import type { BattleMove } from "@/lib/pokeapi";

export function BattleHeader({
  onBack,
  onNewBattle,
}: {
  onBack: () => void;
  onNewBattle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText style={styles.back}>{`‹ ${t("back")}`}</ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.title}>
          {t("battleFight")}
        </ThemedText>
      </View>
      <Pressable onPress={onNewBattle} accessibilityRole="button">
        <ThemedText style={styles.link}>{t("battleNew")}</ThemedText>
      </Pressable>
    </View>
  );
}

export function MoveSelector({
  moves,
  disabled,
  onSelect,
}: {
  moves: BattleMove[];
  disabled: boolean;
  onSelect: (index: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.moves}>
      <ThemedText type="smallBold">{t("battleChooseMove")}</ThemedText>
      {moves.map((move, index) => (
        <Pressable
          key={`${move.name}-${index}`}
          accessibilityRole="button"
          accessibilityLabel={`${move.name}, ${move.type}`}
          disabled={disabled}
          onPress={() => onSelect(index)}
          style={[styles.move, disabled && styles.disabled]}
        >
          <ThemedText style={styles.moveName}>{move.name}</ThemedText>
          <ThemedText style={styles.moveMeta}>
            {move.type} · {move.power ?? 0} power · {move.accuracy ?? 100}%
            accuracy
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export function BattleOutcome({
  winner,
  turns,
  saveError,
}: {
  winner: "player" | "opponent";
  turns: number;
  saveError: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View
      style={[
        styles.winner,
        winner === "player" ? styles.winnerWon : styles.winnerLost,
      ]}
    >
      <ThemedText type="subtitle" style={styles.winnerText}>
        {winner === "player" ? t("battleYouWin") : t("battleYouLose")}
      </ThemedText>
      <ThemedText style={styles.winnerText}>
        {t("battleTurns")}: {turns}
      </ThemedText>
      {saveError && (
        <ThemedText style={styles.winnerText}>
          {t("battleSaveError")}
        </ThemedText>
      )}
    </View>
  );
}

export function BattleLog({ entries }: { entries: string[] }) {
  const { t } = useTranslation();
  return (
    <View style={styles.log}>
      <ThemedText type="smallBold">{t("battleLog")}</ThemedText>
      {entries.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          {t("battleLogEmpty")}
        </ThemedText>
      ) : (
        entries.map((entry, index) => (
          <ThemedText key={`${entry}-${index}`}>{entry}</ThemedText>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.four,
  },
  title: { color: Palette.accent },
  back: { color: Palette.accent, fontWeight: "700" },
  link: { color: Palette.accent, fontWeight: "700" },
  pressed: { opacity: 0.7 },
  moves: { gap: Spacing.two },
  move: {
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: Palette.accent,
  },
  moveName: { color: Palette.white, fontWeight: "800", fontSize: 17 },
  moveMeta: { color: "#DCE8FF" },
  disabled: { opacity: 0.45 },
  winner: {
    alignItems: "center",
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 16,
  },
  winnerWon: { backgroundColor: "#16A34A" },
  winnerLost: { backgroundColor: "#DC2626" },
  winnerText: { color: Palette.white, fontWeight: "800" },
  log: { gap: Spacing.two, padding: Spacing.three },
});
