import * as SQLite from 'expo-sqlite';

import type { PokemonSummary } from '@/lib/pokeapi';

const db = SQLite.openDatabaseSync('favorites.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    types TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

type FavoriteRow = {
	id: number;
	name: string;
	image: string;
	types: string;
};

export async function addFavorite(pokemon: PokemonSummary) {
	await db.runAsync(
		`INSERT OR REPLACE INTO favorites (id, name, image, types)
     VALUES (?, ?, ?, ?)`,
		[pokemon.id, pokemon.name, pokemon.image, JSON.stringify(pokemon.types)],
	);
}

export async function getFavorites(): Promise<PokemonSummary[]> {
	const rows = await db.getAllAsync<FavoriteRow>(
		'SELECT id, name, image, types FROM favorites ORDER BY created_at DESC',
	);
	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		image: row.image,
		types: JSON.parse(row.types) as PokemonSummary['types'],
	}));
}

export async function isFavorite(id: number) {
	const row = await db.getFirstAsync<{ id: number }>(
		'SELECT id FROM favorites WHERE id = ?',
		[id],
	);
	return row !== null;
}

export async function removeFavorite(id: number) {
	await db.runAsync('DELETE FROM favorites WHERE id = ?', [id]);
}
