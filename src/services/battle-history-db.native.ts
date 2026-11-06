import * as SQLite from 'expo-sqlite';

import type { PokemonSummary } from '@/lib/pokeapi';

export type BattleHistoryEntry = {
  id: number;
  player: PokemonSummary;
  opponent: PokemonSummary;
  winner: 'player' | 'opponent';
  turns: number;
  createdAt: string;
};

type BattleRow = {
  id: number;
  player: string;
  opponent: string;
  winner: 'player' | 'opponent';
  turns: number;
  created_at: string;
};

const db = SQLite.openDatabaseSync('battles.db');
db.execSync(`CREATE TABLE IF NOT EXISTS battle_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player TEXT NOT NULL,
  opponent TEXT NOT NULL,
  winner TEXT NOT NULL,
  turns INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`);

export async function addBattleHistory(
  entry: Omit<BattleHistoryEntry, 'id' | 'createdAt'>,
) {
  await db.runAsync(
    'INSERT INTO battle_history (player, opponent, winner, turns) VALUES (?, ?, ?, ?)',
    [JSON.stringify(entry.player), JSON.stringify(entry.opponent), entry.winner, entry.turns],
  );
}

export async function getBattleHistory(): Promise<BattleHistoryEntry[]> {
  const rows = await db.getAllAsync<BattleRow>(
    'SELECT id, player, opponent, winner, turns, created_at FROM battle_history ORDER BY id DESC',
  );
  return rows.map((row) => ({
    id: row.id,
    player: JSON.parse(row.player) as PokemonSummary,
    opponent: JSON.parse(row.opponent) as PokemonSummary,
    winner: row.winner,
    turns: row.turns,
    createdAt: row.created_at,
  }));
}
