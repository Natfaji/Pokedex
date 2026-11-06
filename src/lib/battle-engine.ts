import type { BattleMove, BattlePokemon } from '@/lib/pokeapi';

export type BattleSide = 'player' | 'opponent';

export type BattleState = {
  playerHp: number;
  opponentHp: number;
  turn: number;
  winner: BattleSide | null;
};

export type MoveResult = {
  damage: number;
  hit: boolean;
  effectiveness: 'normal' | 'super' | 'notVery' | 'none';
  multiplier: number;
};

export function calculateMaxHp(pokemon: BattlePokemon) {
  return Math.floor((2 * pokemon.stats.hp * pokemon.level) / 100) + pokemon.level + 10;
}

export function getEffectiveness(
  moveType: string,
  defenderTypes: string[],
  relations: Record<string, { doubleDamageTo: string[]; halfDamageTo: string[]; noDamageTo: string[] }>,
) {
  return defenderTypes.reduce((multiplier, defenderType) => {
    const relation = relations[moveType];
    if (!relation) return multiplier;
    if (relation.noDamageTo.includes(defenderType)) return multiplier * 0;
    if (relation.doubleDamageTo.includes(defenderType)) return multiplier * 2;
    if (relation.halfDamageTo.includes(defenderType)) return multiplier * 0.5;
    return multiplier;
  }, 1);
}

export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove,
  relations: Record<string, { doubleDamageTo: string[]; halfDamageTo: string[]; noDamageTo: string[] }>,
  randomFactor = 100,
): MoveResult {
  if (move.damageClass === 'status' || move.power === null) {
    return { damage: 0, hit: true, effectiveness: 'normal', multiplier: 1 };
  }
  const accuracyRoll = Math.random() * 100;
  if (move.accuracy !== null && accuracyRoll >= move.accuracy) {
    return { damage: 0, hit: false, effectiveness: 'normal', multiplier: 1 };
  }

  const attackStat =
    move.damageClass === 'special' ? attacker.stats['special-attack'] : attacker.stats.attack;
  const defenseStat =
    move.damageClass === 'special'
      ? defender.stats['special-defense']
      : defender.stats.defense;
  const base = Math.floor(
    Math.floor(
      Math.floor((2 * attacker.level) / 5 + 2) * move.power * attackStat,
    ) / defenseStat / 50,
  ) + 2;
  const stab = attacker.types.some(({ name }) => name === move.type) ? 1.5 : 1;
  const multiplier = getEffectiveness(
    move.type,
    defender.types.map(({ name }) => name),
    relations,
  );
  const damage =
    multiplier === 0
      ? 0
      : Math.max(Math.floor(Math.floor(base * (randomFactor / 100) * stab) * multiplier), 1);
  return {
    damage,
    hit: true,
    multiplier,
    effectiveness:
      multiplier === 0
        ? 'none'
        : multiplier > 1
          ? 'super'
          : multiplier < 1
            ? 'notVery'
            : 'normal',
  };
}

export function orderSides(
  player: BattlePokemon,
  opponent: BattlePokemon,
  random = Math.random(),
): BattleSide[] {
  if (player.stats.speed > opponent.stats.speed) return ['player', 'opponent'];
  if (opponent.stats.speed > player.stats.speed) return ['opponent', 'player'];
  return random < 0.5 ? ['player', 'opponent'] : ['opponent', 'player'];
}
