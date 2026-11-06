import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import { getBattleHistory } from "@/services/battle-history-db";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const history = useQuery({
    queryKey: ["battle-history"],
    queryFn: getBattleHistory,
    staleTime: 0,
  });
  if (history.isLoading) return <State message={t("battleHistoryLoading")} />;
  if (history.isError) {
    return (
      <State
        message={t("error")}
        action={t("tryAgain")}
        onAction={() => void history.refetch()}
      />
    );
  }
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t("battleHistory")}
        </ThemedText>
        {history.data?.length === 0 ? (
          <ThemedText themeColor="textSecondary">
            {t("battleHistoryEmpty")}
          </ThemedText>
        ) : (
          history.data?.map((entry) => (
            <ThemedView type="card" key={entry.id} style={styles.entry}>
              <View style={styles.pokemon}>
                <Image
                  source={entry.player.image}
                  cachePolicy="memory-disk"
                  style={styles.image}
                />
                <ThemedText type="smallBold">{entry.player.name}</ThemedText>
              </View>
              <View style={styles.result}>
                <ThemedText style={styles.winner}>
                  {entry.winner === "player"
                    ? entry.player.name
                    : entry.opponent.name}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {entry.turns} {t("battleTurns")}
                </ThemedText>
              </View>
              <View style={styles.pokemon}>
                <Image
                  source={entry.opponent.image}
                  cachePolicy="memory-disk"
                  style={styles.image}
                />
                <ThemedText type="smallBold">{entry.opponent.name}</ThemedText>
              </View>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

function State({
  message,
  action,
  onAction,
}: {
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <ThemedView style={styles.state}>
      <ThemedText type="subtitle">{message}</ThemedText>
      {action && onAction && (
        <Pressable
          onPress={onAction}
          style={styles.button}
          accessibilityRole="button"
        >
          <ThemedText style={styles.buttonText}>{action}</ThemedText>
        </Pressable>
      )}
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
  entry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.three,
    borderRadius: 18,
  },
  pokemon: { alignItems: "center", gap: Spacing.one, flex: 1 },
  image: { width: 70, height: 70 },
  result: { alignItems: "center", gap: Spacing.one },
  winner: { color: Palette.accent, fontWeight: "800" },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.four,
  },
  button: {
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: Palette.accent,
  },
  buttonText: { color: Palette.white, fontWeight: "700" },
});
