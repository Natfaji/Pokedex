# Battle setup

## Goal

Users can choose two Pokémon and start a battle using current data from
PokeAPI. The setup is intentionally small so a user can get into a fight
quickly.

## Constraints

- The setup is reachable from the existing Pokedex navigation and opens the
  battle flow without replacing existing list, detail, or favorites flows.
- The user chooses one Pokémon for each side by searching by name or choosing
  a random Pokémon.
- Pokémon, base stats, moves, move details, and type-effectiveness data come
  from PokeAPI; no Pokémon or battle data is hardcoded in the app.
- Both Pokémon start at level 50 with their base stats as returned by the API.
- The screen must show loading and error states for every API-backed load and
  provide a retry action after an error.
- Reuse the existing theme, localization, Expo Router navigation, and
  TanStack Query conventions. Do not add a dependency unless the existing
  project cannot provide the required behavior.

## Acceptance Criteria

- [ ] **REQ-001**: A user can select one Pokémon for the player's side by
  searching by name or choosing a random Pokémon.
- [ ] **REQ-002**: A user can select one Pokémon for the opponent's side by
  searching by name or choosing a random Pokémon.
- [ ] **REQ-003**: The selected Pokémon's name, artwork, types, and level 50
  starting HP are visible before the battle starts.
- [ ] **REQ-004**: The user cannot start a battle until both sides have a
  selected Pokémon.
- [ ] **REQ-005**: Starting a valid setup opens the battle screen with both
  selected Pokémon and their API-backed battle data.
- [ ] **REQ-006**: Loading and API failure states are visible and actionable
  for Pokémon, move, and type-effectiveness data used by setup.

## Out of Scope

- Team battles or more than one Pokémon on either side.
- Abilities, held items, status effects, weather, or breeding data.
- Saving an unfinished setup or resuming an unfinished battle.
- Competitive matchmaking, accounts, or online multiplayer.
