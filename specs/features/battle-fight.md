# Pokémon battle

## Goal

Users can play a short turn-based battle between two level 50 Pokémon and
understand why each turn succeeds, fails, or deals damage.

## Constraints

- The battle uses one Pokémon per side and starts with the base stats returned
  by PokeAPI.
- Turns are resolved in descending Speed order. If Speed is tied, the order is
  selected randomly once for that turn.
- On each turn the user chooses one real move belonging to the player's
  Pokémon. The opponent's move is selected randomly from its usable moves.
- Each move displays its API-provided power, type, and accuracy. A move without
  power uses Struggle from PokeAPI.
- Damage follows the generation V-and-later official formula: level, the
  attack/defense pair or special-attack/special-defense pair selected by the
  move's damage class, power, a random factor from 85% through 100%, and STAB
  x1.5 when applicable.
- Type effectiveness is read from PokeAPI's type damage relations. Both
  defender types affect the multiplier, and the type data is loaded once for
  the battle rather than fetched on every turn.
- The battle must visibly communicate hit, miss, no effect, not very effective,
  and super effective outcomes, as well as current HP.
- The log identifies whether each action belongs to the player or opponent and
  records the winner when the battle ends.
- The opponent's attack starts after a short visible pause so the player can
  follow the turn order.
- The Pokémon receiving damage briefly shows a damage effect.
- A battle ends immediately when either Pokémon reaches zero HP. The winner
  and total number of turns are then available to history.
- The screen must show loading and error states for every API-backed load and
  provide retry or a clear way to return to setup.

## Acceptance Criteria

- [ ] **REQ-007**: The battle screen shows both Pokémon, current HP, maximum
  HP, and a visible HP bar for each side.
- [ ] **REQ-008**: The player's available moves show name, type, power, and
  accuracy, with a clear disabled or unavailable state while a turn is being
  resolved.
- [ ] **REQ-009**: Selecting a move resolves the turn in Speed order; a Speed
  tie uses a random order for that turn.
- [ ] **REQ-010**: A move can miss according to its accuracy, and the battle
  log explicitly reports the miss without reducing HP.
- [ ] **REQ-011**: A successful move calculates damage using level 50, the
  correct physical or special stat pair, move power, the 85–100% random factor,
  and STAB when the attacker shares the move type.
- [ ] **REQ-012**: Damage applies type effectiveness for both defender types
  using API-provided relations, and the log identifies no effect, not very
  effective, super effective, or a normal hit.
- [ ] **REQ-013**: When a Pokémon reaches zero HP, the battle stops accepting
  moves and identifies the winner.
- [ ] **REQ-014**: Every resolved turn adds a readable entry to a battle log
  containing whether the actor is the player or opponent, the Pokémon name,
  move, outcome, and damage or miss result.
- [ ] **REQ-022**: When the battle ends, the battle log identifies the winning
  side and Pokémon.
- [ ] **REQ-023**: The outcome bar is green when the player wins and red when
  the player loses.
- [ ] **REQ-024**: The opponent's attack begins after a short delay, and the
  receiving Pokémon displays a brief damage effect after damage is applied.
- [ ] **REQ-025**: Each attack displays a popup on the target containing the
  damage amount or a miss result.
- [ ] **REQ-026**: The UI provides a larger, differently colored critical-hit
  popup style, while the current battle rules do not generate critical hits.
- [ ] **REQ-015**: Loading and API failure states are visible for Pokémon,
  moves, and type-effectiveness data, with retry behavior that does not create
  duplicate turns.

## Out of Scope

- Abilities, held items, critical hits, status effects, weather, recoil,
  priority, switching, multi-hit moves, charging moves, and other special move
  effects.
- Experience, leveling, evolution, capture, or team management.
- Player-versus-player networking or an opponent controlled by an account.
