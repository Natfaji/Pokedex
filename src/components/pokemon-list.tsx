import { memo, useCallback, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PokemonCard from "@/components/pokemon-card";
import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";
import type { PokemonSummary } from "@/lib/pokeapi";

type PokemonListProps = {
  data: PokemonSummary[];
  header?: ReactElement;
  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  numColumns?: number;
  onLoadMore?: () => void;
  favoriteIds?: ReadonlySet<number>;
  onToggleFavorite?: (pokemon: PokemonSummary) => void;
};

type PokemonGridItemProps = {
  item: PokemonSummary | number;
  columns: number;
  favorite?: boolean;
  onToggleFavorite?: (pokemon: PokemonSummary) => void;
};

const PokemonGridItem = memo(function PokemonGridItem({
  item,
  columns,
  favorite,
  onToggleFavorite,
}: PokemonGridItemProps) {
  return (
    <View
      style={{
        width: `${100 / columns}%`,
        paddingHorizontal: Spacing.two,
        marginBottom: Spacing.three,
      }}
    >
      {typeof item === "number" ? (
        <PokemonCard isLoading />
      ) : (
        <PokemonCard
          pokemon={item}
          favorite={favorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </View>
  );
});

export default function PokemonList({
  data,
  header,
  emptyMessage,
  isLoading = false,
  isError = false,
  isFetchingNextPage = false,
  numColumns,
  onLoadMore,
  favoriteIds,
  onToggleFavorite,
}: PokemonListProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const columns = numColumns ?? (width >= 1200 ? 4 : width >= 768 ? 3 : 2);
  const items = isLoading
    ? Array.from({ length: columns * 2 }, (_, index) => index)
    : data;
  const renderItem = useCallback(
    ({ item }: { item: PokemonSummary | number }) => (
      <PokemonGridItem
        item={item}
        columns={columns}
        favorite={typeof item === "number" ? false : favoriteIds?.has(item.id)}
        onToggleFavorite={onToggleFavorite}
      />
    ),
    [columns, favoriteIds, onToggleFavorite],
  );

  return (
    <FlatList<PokemonSummary | number>
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + Spacing.six,
        },
      ]}
      data={items}
      keyExtractor={(item) =>
        typeof item === "number" ? `skeleton-${item}` : String(item.id)
      }
      numColumns={columns}
      key={`pokemon-grid-${columns}`}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={styles.header}
      renderItem={renderItem}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        isError ? (
          <View style={styles.state}>
            <ThemedText>{t("error")}</ThemedText>
          </View>
        ) : emptyMessage ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary">{emptyMessage}</ThemedText>
          </View>
        ) : undefined
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator
            accessibilityLabel={t("loading")}
            color={Palette.accent}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    zIndex: 10,
    elevation: 10,
  },
  content: {
    paddingHorizontal: Spacing.three,
  },
  state: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
});
