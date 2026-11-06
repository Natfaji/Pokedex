import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BattleHistoryEntry } from './battle-history-db.native';

const KEY = 'pokedex:battle-history';

export async function addBattleHistory(
  entry: Omit<BattleHistoryEntry, 'id' | 'createdAt'>,
) {
  const current = await getBattleHistory();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify([
      { ...entry, id: Date.now(), createdAt: new Date().toISOString() },
      ...current,
    ]),
  );
}

export async function getBattleHistory(): Promise<BattleHistoryEntry[]> {
  const stored = await AsyncStorage.getItem(KEY);
  return stored ? (JSON.parse(stored) as BattleHistoryEntry[]) : [];
}
