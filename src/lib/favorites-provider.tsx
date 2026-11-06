import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import type { PokemonSummary } from "@/lib/pokeapi";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favorites-db";

type FavoritesState = {
  favorites: PokemonSummary[];
  favoriteIds: ReadonlySet<number>;
  hydrated: boolean;
  error: string | null;
};

type FavoritesActions = {
  isFavorite: (id: number) => boolean;
  toggleFavorite: (pokemon: PokemonSummary) => void;
  clearError: () => void;
};

const FavoritesStateContext = createContext<FavoritesState | null>(null);
const FavoritesActionsContext = createContext<FavoritesActions | null>(null);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<PokemonSummary[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const favoritesRef = useRef(favorites);
  const persistenceQueue = useRef(Promise.resolve());

  useEffect(() => {
    getFavorites()
      .then((storedFavorites) => {
        favoritesRef.current = storedFavorites;
        setFavorites(storedFavorites);
      })
      .catch(() => {
        setError("Unable to load favorites.");
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  const enqueuePersistence = useCallback(
    (pokemon: PokemonSummary, shouldBeFavorite: boolean) => {
      const operation = shouldBeFavorite
        ? () => addFavorite(pokemon)
        : () => removeFavorite(pokemon.id);

      persistenceQueue.current = persistenceQueue.current
        .catch(() => undefined)
        .then(operation)
        .catch(() => {
          setError("Unable to save favorites.");
          const currentFavorites = favoritesRef.current;
          const stillAtRequestedState =
            currentFavorites.some(({ id }) => id === pokemon.id) ===
            shouldBeFavorite;

          if (stillAtRequestedState) {
            const rolledBack = shouldBeFavorite
              ? currentFavorites.filter(({ id }) => id !== pokemon.id)
              : [...currentFavorites, pokemon];
            favoritesRef.current = rolledBack;
            setFavorites(rolledBack);
          }
        });
    },
    [],
  );

  const toggleFavorite = useCallback(
    (pokemon: PokemonSummary) => {
      const shouldBeFavorite = !favoritesRef.current.some(
        ({ id }) => id === pokemon.id,
      );
      const nextFavorites = shouldBeFavorite
        ? [...favoritesRef.current, pokemon]
        : favoritesRef.current.filter(({ id }) => id !== pokemon.id);

      favoritesRef.current = nextFavorites;
      setFavorites(nextFavorites);
      enqueuePersistence(pokemon, shouldBeFavorite);
    },
    [enqueuePersistence],
  );

  const isFavorite = useCallback(
    (id: number) => favoritesRef.current.some((favorite) => favorite.id === id),
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  const state = useMemo<FavoritesState>(
    () => ({
      favorites,
      favoriteIds: new Set(favorites.map(({ id }) => id)),
      hydrated,
      error,
    }),
    [favorites, hydrated, error],
  );

  const actions = useMemo(
    () => ({ isFavorite, toggleFavorite, clearError }),
    [isFavorite, toggleFavorite, clearError],
  );

  return (
    <FavoritesStateContext.Provider value={state}>
      <FavoritesActionsContext.Provider value={actions}>
        {children}
      </FavoritesActionsContext.Provider>
    </FavoritesStateContext.Provider>
  );
}

export function useFavoritesState() {
  const context = useContext(FavoritesStateContext);
  if (!context) {
    throw new Error("useFavoritesState must be used inside FavoritesProvider");
  }
  return context;
}

export function useFavoritesActions() {
  const context = useContext(FavoritesActionsContext);
  if (!context) {
    throw new Error("useFavoritesActions must be used inside FavoritesProvider");
  }
  return context;
}
