import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PokemonSummary } from '@/lib/pokeapi';

const FAVORITES_KEY = 'pokedex:favorites:web';

async function readFavorites() {
	const stored = await AsyncStorage.getItem(FAVORITES_KEY);
	return stored ? (JSON.parse(stored) as PokemonSummary[]) : [];
}

async function writeFavorites(favorites: PokemonSummary[]) {
	await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export async function addFavorite(pokemon: PokemonSummary) {
	const favorites = await readFavorites();
	await writeFavorites([
		...favorites.filter(({ id }) => id !== pokemon.id),
		pokemon,
	]);
}

export function getFavorites() {
	return readFavorites();
}

export async function isFavorite(id: number) {
	const favorites = await readFavorites();
	return favorites.some((pokemon) => pokemon.id === id);
}

export async function removeFavorite(id: number) {
	const favorites = await readFavorites();
	await writeFavorites(favorites.filter((pokemon) => pokemon.id !== id));
}
