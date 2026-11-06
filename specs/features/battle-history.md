# Battle history

## Goal

Users can review completed battles after leaving the battle and after
restarting the app, so the battle feature has a persistent result beyond the
current screen.

## Constraints

- Save only completed battles after a winner has been determined.
- Store enough information to display both Pokémon, the winner, and the number
  of turns without requiring the original battle to be replayed.
- Use the app's existing SQLite persistence approach and keep history separate
  from favorites.
- The history screen is reachable from the app navigation and has an explicit
  empty state.
- History loads must show a loading state and an error state with retry.

## Acceptance Criteria

- [ ] **REQ-016**: A completed battle is stored with the player's Pokémon,
  opponent's Pokémon, winner, and total number of turns.
- [ ] **REQ-017**: An incomplete, cancelled, or errored battle is not shown as
  a completed history entry.
- [ ] **REQ-018**: The history screen lists completed battles in newest-first
  order and shows both Pokémon, the winner, and turn count for each entry.
- [ ] **REQ-019**: The history screen shows a clear empty state when no
  completed battles exist.
- [ ] **REQ-020**: History entries remain available after the app is closed and
  restarted.
- [ ] **REQ-021**: A history database failure shows an error state and a retry
  action rather than an empty success state.

## Out of Scope

- Replaying a historical battle or restoring its turn-by-turn state.
- Editing, sharing, exporting, or deleting individual history entries.
- Cloud synchronization, accounts, rankings, or statistics beyond turn count.
