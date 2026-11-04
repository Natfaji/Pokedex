import { Pressable, StyleSheet, View } from "react-native";

import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { usePokemonNameSearch } from "@/lib/queries";

type SearchBarWithResultsProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onSelect: (name: string) => void;
  placeholder: string;
  submitLabel: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  showResults?: boolean;
};

function displayName(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SearchBarWithResults({
  value,
  onChangeText,
  onSubmit,
  onSelect,
  placeholder,
  submitLabel,
  seeAllLabel,
  onSeeAll,
  showResults = true,
}: SearchBarWithResultsProps) {
  const theme = useTheme();
  const searchQuery = usePokemonNameSearch(value);
  const hasResults =
    showResults && value.trim().length >= 3 && searchQuery.data.length > 0;

  return (
    <View style={styles.container}>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        placeholder={placeholder}
        submitLabel={submitLabel}
      />
      {hasResults && (
        <View
          style={[
            styles.results,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundSelected,
              shadowColor: theme.text,
            },
          ]}
        >
          {searchQuery.data.slice(0, 5).map((pokemon) => (
            <Pressable
              key={pokemon.name}
              accessibilityRole="button"
              accessibilityLabel={displayName(pokemon.name)}
              onPress={() => onSelect(pokemon.name)}
              style={({ pressed }) => [
                styles.result,
                { borderBottomColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold">
                {displayName(pokemon.name)}
              </ThemedText>
            </Pressable>
          ))}
          {onSeeAll && seeAllLabel && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={seeAllLabel}
              onPress={onSeeAll}
              style={({ pressed }) => [
                styles.seeAll,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.seeAllText}>{seeAllLabel}</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 20,
  },
  results: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    zIndex: 20,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  result: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  seeAll: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.accent,
  },
  seeAllText: {
    color: Palette.white,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
  },
});
