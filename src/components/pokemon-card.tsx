import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import type { PokemonSummary } from "@/lib/pokeapi";

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

type PokemonCardProps = {
  pokemon: PokemonSummary;
  onPress: () => void;
  onToggleFavorite?: () => void;
  favorite?: boolean;
  favoriteLabel?: string;
};

export function PokemonCard({
  pokemon,
  onPress,
  onToggleFavorite,
  favorite = false,
  favoriteLabel,
}: PokemonCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={formatName(pokemon.name)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.imageFrame}>
        <Image
          source={pokemon.image}
          contentFit="contain"
          style={styles.image}
        />
      </ThemedView>
      <ThemedView type="backgroundElement" style={styles.details}>
        <View style={styles.nameRow}>
          <ThemedText themeColor="text" type="smallBold" style={styles.name}>
            {formatName(pokemon.name)}
          </ThemedText>
          {onToggleFavorite && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favoriteLabel}
              onPress={onToggleFavorite}
              hitSlop={8}
            >
              <ThemedText style={favorite ? styles.favorite : styles.muted}>
                {favorite ? "★" : "☆"}
              </ThemedText>
            </Pressable>
          )}
        </View>
        <View style={styles.types}>
          {pokemon.types.map((type) => (
            <ThemedText key={type.name} type="small" themeColor="textSecondary">
              {formatName(type.name)}
            </ThemedText>
          ))}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Palette.white,
    boxShadow: "0px 3px 8px rgba(16, 24, 40, 0.1)",
  },
  pressed: {
    opacity: 0.72,
  },
  imageFrame: {
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "86%",
    height: "86%",
  },
  details: {
    borderTopWidth: 3,
    gap: Spacing.one,
    padding: Spacing.three,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
  types: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  favorite: {
    color: Palette.accent,
    fontSize: 22,
  },
  muted: {
    color: Palette.muted,
    fontSize: 22,
  },
});
