import { Image } from "expo-image";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Palette, Spacing } from "@/constants/theme";
import type { PokemonSummary } from "@/lib/pokeapi";
import { useTranslation } from "react-i18next";

type PokemonCardProps = {
  pokemon: PokemonSummary;
  onPress: () => void;
  onToggleFavorite?: () => void;
  favorite?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PokemonCard({
  pokemon,
  onPress,
  onToggleFavorite,
  favorite = false,
  style,
}: PokemonCardProps) {
  const { t } = useTranslation();
  const name = formatName(pokemon.name);
  const types = pokemon.types.map((type) =>
    t(`types.${type.name}`, { defaultValue: formatName(type.name) }),
  );

  function formatName(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return (
    <ThemedView type="background" style={[styles.card, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={formatName(pokemon.name)}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.imageFrame}>
          <Image
            source={pokemon.image}
            contentFit="contain"
            transition={150}
            style={styles.image}
          />
        </View>
        <View style={styles.details}>
          <ThemedText type="smallBold">{name}</ThemedText>
          <View style={styles.types}>
            {types.map((label) => (
              <ThemedText key={label} type="small" themeColor="textSecondary">
                {label}
              </ThemedText>
            ))}
          </View>
        </View>
      </Pressable>

      {onToggleFavorite && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(favorite ? "removeFavorite" : "addFavorite", {
            name,
          })}
          accessibilityState={{ selected: favorite }}
          onPress={() => onToggleFavorite()}
          hitSlop={12}
          style={styles.favoriteButton}
        >
          <ThemedText style={favorite ? styles.favorite : styles.muted}>
            {favorite ? "★" : "☆"}
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0px 3px 8px rgba(16, 24, 40, 0.1)",
    borderWidth: 3,
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
    borderTopColor: Palette.border,
    gap: Spacing.one,
    padding: Spacing.three,
  },
  types: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
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
