import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type PropsWithChildren,
} from "react";

import i18n, { type Language } from "@/lib/i18n";
const LANGUAGE_KEY = "pokedex:language";

type AppContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(
    i18n.language === "nl" ? "nl" : "en",
  );

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((storedLanguage) => {
        if (storedLanguage === "en" || storedLanguage === "nl") {
          setLanguageState(storedLanguage);
          void i18n.changeLanguage(storedLanguage);
        }
      })
      .catch(() => undefined);
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
    void AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
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
