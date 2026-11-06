import { afterEach, describe, expect, it, vi } from "vitest";

import {
  calculateDamage,
  calculateMaxHp,
  getEffectiveness,
  orderSides,
} from "@/lib/battle-engine";
import type { BattleMove, BattlePokemon } from "@/lib/pokeapi";

const relations = {
  fire: {
    doubleDamageTo: ["grass"],
    halfDamageTo: ["water"],
    noDamageTo: [],
  },
  normal: {
    doubleDamageTo: [],
    halfDamageTo: [],
    noDamageTo: ["ghost"],
  },
};

function pokemon(
  name: string,
  types: string[],
  stats: Partial<BattlePokemon["stats"]> = {},
): BattlePokemon {
  return {
    id: 1,
    name,
    image: "https://example.test/pokemon.png",
    types: types.map((type) => ({ name: type })),
    level: 50,
    stats: {
      hp: 100,
      attack: 100,
      defense: 100,
      "special-attack": 100,
      "special-defense": 100,
      speed: 100,
      ...stats,
    },
    moves: [],
  };
}

const fireMove: BattleMove = {
  name: "ember",
  power: 40,
  type: "fire",
  accuracy: 100,
  damageClass: "special",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("battle engine", () => {
  it("calculates level 50 maximum HP", () => {
    expect(calculateMaxHp(pokemon("test", ["normal"]))).toBe(160);
  });

  it("applies accuracy and returns a miss without damage", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    const result = calculateDamage(
      pokemon("attacker", ["fire"]),
      pokemon("defender", ["grass"]),
      { ...fireMove, accuracy: 50 },
      relations,
    );

    expect(result).toMatchObject({ damage: 0, hit: false });
  });

  it("applies STAB and type effectiveness", () => {
    const attacker = pokemon("attacker", ["fire"]);
    const defender = pokemon("defender", ["grass"]);
    const withStab = calculateDamage(attacker, defender, fireMove, relations, 100);
    const withoutStab = calculateDamage(
      pokemon("attacker", ["water"]),
      defender,
      fireMove,
      relations,
      100,
    );

    expect(withStab.multiplier).toBe(2);
    expect(withStab.damage).toBeGreaterThan(withoutStab.damage);
  });

  it("multiplies effectiveness across both defender types", () => {
    expect(getEffectiveness("fire", ["grass", "water"], relations)).toBe(1);
    expect(getEffectiveness("normal", ["ghost"], relations)).toBe(0);
  });

  it("orders by speed and randomizes speed ties", () => {
    const fast = pokemon("fast", ["normal"], { speed: 120 });
    const slow = pokemon("slow", ["normal"], { speed: 80 });

    expect(orderSides(fast, slow)).toEqual(["player", "opponent"]);
    expect(orderSides(slow, fast)).toEqual(["opponent", "player"]);
    expect(orderSides(fast, fast, 0.1)).toEqual(["player", "opponent"]);
    expect(orderSides(fast, fast, 0.9)).toEqual(["opponent", "player"]);
  });
});
