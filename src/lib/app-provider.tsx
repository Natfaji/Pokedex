import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import i18n, { type Language } from "@/lib/i18n";
import type { PokemonSummary } from "@/lib/pokeapi";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favorites-db";

const LANGUAGE_KEY = "pokedex:language";

type AppContextValue = {
  favorites: PokemonSummary[];
  language: Language;
  hydrated: boolean;
  toggleFavorite: (pokemon: PokemonSummary) => void;
  isFavorite: (name: string) => boolean;
  setLanguage: (language: Language) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<PokemonSummary[]>([]);
  const [language, setLanguageState] = useState<Language>(
    i18n.language === "nl" ? "nl" : "en",
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([getFavorites(), AsyncStorage.getItem(LANGUAGE_KEY)])
      .then(([storedFavorites, storedLanguage]) => {
        setFavorites(storedFavorites);
        if (storedLanguage === "en" || storedLanguage === "nl") {
          setLanguageState(storedLanguage);
          void i18n.changeLanguage(storedLanguage);
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  const toggleFavorite = (pokemon: PokemonSummary) => {
    const alreadyFavorite = favorites.some(({ name }) => name === pokemon.name);
    setFavorites((current) =>
      alreadyFavorite
        ? current.filter(({ name }) => name !== pokemon.name)
        : [...current, pokemon],
    );
    void (
      alreadyFavorite ? removeFavorite(pokemon.id) : addFavorite(pokemon)
    ).catch(() => undefined);
  };

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
    void AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  return (
    <AppContext.Provider
      value={{
        favorites,
        language,
        hydrated,
        toggleFavorite,
        isFavorite: (name) =>
          favorites.some((favorite) => favorite.name === name),
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
