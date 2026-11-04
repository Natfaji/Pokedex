/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#172033',
    background: '#F5F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EEF8',
    textSecondary: '#526174',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#CBD5E1',
  },
} as const;

export const Palette = {
  accent: '#2563EB',
  accentDark: '#1D4ED8',
  border: '#CBD5E1',
  barTrack: '#E2E8F0',
  blue: '#3B82F6',
  blueDark: '#1D4ED8',
  link: '#1D4ED8',
  muted: '#64748B',
  placeholder: '#64748B',
  white: '#ffffff',
} as const;

export const PokemonTypeColors: Record<string, string> = {
  bug: '#91a119',
  dark: '#624d4e',
  dragon: '#5060e1',
  electric: '#fac000',
  fairy: '#ef70ef',
  fighting: '#ff8000',
  fire: '#e62829',
  flying: '#81b9ef',
  ghost: '#704170',
  grass: '#3fa129',
  ground: '#915121',
  ice: '#3fd8ff',
  normal: '#9fa19f',
  poison: '#9141cb',
  psychic: '#ef4179',
  rock: '#afa981',
  steel: '#60a1b8',
  water: '#2980ef',
};

export function getPokemonTypeColor(type: string) {
  return PokemonTypeColors[type] ?? Palette.accent;
}

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
