import { useRouter } from "expo-router";
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
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type PokemonCardProps = {
  pokemon?: PokemonSummary;
  isLoading?: boolean;
  onToggleFavorite?: (pokemon: PokemonSummary) => void;
  favorite?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PokemonCardSkeleton({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) {
  const sweep = useSharedValue(-1);
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(sweep.value, [-1, 1], [-180, 180]),
      },
    ],
  }));

  React.useEffect(() => {
    // Reanimated shared values are intentionally mutated to start the sweep.
    // eslint-disable-next-line react-hooks/immutability
    sweep.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);

    return () => cancelAnimation(sweep);
  }, [sweep]);

  return (
    <ThemedView
      accessibilityLabel="Loading Pokémon"
      accessibilityRole="progressbar"
      style={[styles.card, style]}
    >
      <View style={styles.imageFrame}>
        <View style={styles.skeletonImage}>
          <Animated.View style={[styles.skeletonSweep, sweepStyle]} />
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.skeletonTitle}>
          <Animated.View style={[styles.skeletonSweep, sweepStyle]} />
        </View>
        <View style={styles.skeletonType}>
          <Animated.View style={[styles.skeletonSweep, sweepStyle]} />
        </View>
      </View>
    </ThemedView>
  );
}

function PokemonCard({
  pokemon,
  isLoading = false,
  onToggleFavorite,
  favorite = false,
  style,
}: PokemonCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const name = pokemon ? formatName(pokemon.name) : "";
  const types =
    pokemon?.types.map((type) => ({
      name: type.name,
      label: t(`types.${type.name}`, { defaultValue: formatName(type.name) }),
    })) ?? [];

  if (isLoading || !pokemon) {
    return <PokemonCardSkeleton style={style} />;
  }

  function formatName(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return (
    <ThemedView type="background" style={[styles.card, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={() =>
          router.push({
            pathname: "/pokemon/[name]",
            params: { name: pokemon.name },
          })
        }
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={styles.imageFrame}>
          <Image
            source={pokemon.image}
            cachePolicy={"memory-disk"}
            style={styles.image}
          />
        </View>
        <View style={styles.details}>
          <ThemedText type="smallBold">{name}</ThemedText>
          <View style={styles.types}>
            {types.map(({ name: typeName, label }) => (
              <ThemedText key={typeName} type="small" themeColor="textSecondary">
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
          onPress={() => onToggleFavorite(pokemon)}
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

export default React.memo(PokemonCard);

const styles = StyleSheet.create({
  card: {
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
  skeletonImage: {
    width: "86%",
    height: "86%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Palette.barTrack,
  },
  skeletonTitle: {
    height: 20,
    width: "62%",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: Palette.barTrack,
  },
  skeletonType: {
    height: 20,
    width: "42%",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: Palette.barTrack,
  },
  skeletonSweep: {
    height: "100%",
    width: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
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
    fontSize: 28,
  },
  muted: {
    color: Palette.muted,
    fontSize: 28,
  },
});
