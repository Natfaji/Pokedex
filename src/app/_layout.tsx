import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppProvider } from "@/lib/app-provider";
import { FavoritesProvider } from "@/lib/favorites-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 2,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <FavoritesProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="search" />
              <Stack.Screen name="pokemon/[name]" />
              <Stack.Screen name="types/[type]" />
              <Stack.Screen name="compare" />
              <Stack.Screen name="battle" />
              <Stack.Screen name="battle/fight" />
            </Stack>
          </ThemeProvider>
        </FavoritesProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
