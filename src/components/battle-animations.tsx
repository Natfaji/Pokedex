import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";

export function AttackPopup({
  text,
  kind,
}: {
  text: string;
  kind: "damage" | "miss" | "critical";
}) {
  const progress = useSharedValue(0);
  const popupStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: -progress.value * 18 }],
  }));

  useEffect(() => {
    // Reanimated shared values are intentionally mutated to animate the popup.
    // eslint-disable-next-line react-hooks/immutability
    progress.value = 0;
    progress.value = withTiming(1, { duration: 180 });
  }, [kind, progress, text]);

  return (
    <Animated.View
      accessibilityLabel={text}
      style={[
        styles.attackPopup,
        kind === "miss" && styles.missPopup,
        kind === "critical" && styles.criticalPopup,
        popupStyle,
      ]}
    >
      <ThemedText style={styles.popupText}>{text}</ThemedText>
    </Animated.View>
  );
}

export function DamageImage({
  image,
  name,
  damageVersion,
}: {
  image: string;
  name: string;
  damageVersion: number;
}) {
  const shakeProgress = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const damageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shakeProgress.value,
          [0, 0.2, 0.4, 0.6, 0.8, 1],
          [0, 8, -8, 8, -8, 0],
        ),
      },
      {
        translateY: interpolate(
          shakeProgress.value,
          [0, 0.2, 0.4, 0.6, 0.8, 1],
          [0, -8, 8, -8, 8, 0],
        ),
      },
    ],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  useEffect(() => {
    if (damageVersion === 0) return;
    // Reanimated shared values are intentionally mutated to trigger the hit effect.
    // eslint-disable-next-line react-hooks/immutability
    shakeProgress.value = 0;
    shakeProgress.value = withTiming(1, { duration: 320 });
    // eslint-disable-next-line react-hooks/immutability
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 45 }),
      withTiming(0, { duration: 220 }),
    );
  }, [damageVersion, flashOpacity, shakeProgress]);

  return (
    <Animated.View style={[styles.image, damageStyle]}>
      <Image
        accessibilityLabel={name}
        source={image}
        cachePolicy="memory-disk"
        style={styles.image}
        contentFit="contain"
      />
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, flashStyle]}
      >
        <Image
          source={image}
          tintColor={Palette.white}
          cachePolicy="memory-disk"
          style={styles.image}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: { width: 110, height: 110 },
  attackPopup: {
    position: "absolute",
    top: 4,
    right: -8,
    minWidth: 62,
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 12,
    backgroundColor: "#DC2626",
  },
  missPopup: { backgroundColor: "#64748B" },
  criticalPopup: {
    minWidth: 96,
    paddingVertical: Spacing.two,
    backgroundColor: "#D97706",
    transform: [{ rotate: "-6deg" }],
  },
  popupText: { color: Palette.white, fontSize: 18, fontWeight: "900" },
});
