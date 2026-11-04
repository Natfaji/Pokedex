import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getPokemonTypeColor, Spacing } from "@/constants/theme";
import type { PokemonTypeSummary } from "@/lib/pokeapi";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

type PokemonTypeCardProps = {
  type: PokemonTypeSummary;
  onPress: () => void;
};

export function PokemonTypeCard({ type, onPress }: PokemonTypeCardProps) {
  const color = getPokemonTypeColor(type.name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={formatName(type.name)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.cardContent}>
        <View style={[styles.swatch, { backgroundColor: color }]} />
        <ThemedText type="smallBold" themeColor="text">
          {formatName(type.name)}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: 12,
    boxShadow: "0px 3px 8px rgba(16, 24, 40, 0.1)",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.72,
  },
});
