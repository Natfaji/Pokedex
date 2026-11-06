# Battle requirements checklist

## Assignment coverage

- [ ] Battle setup, fight, and history each have their own feature spec and
  GitHub issue.
- [ ] The feature uses live PokeAPI data rather than hardcoded Pokémon or
  battle data.
- [ ] Both Pokémon start at level 50 with API base stats.
- [ ] Turns resolve by Speed, with random tie-breaking.
- [ ] Player moves and random opponent moves are supported.
- [ ] Struggle is used when a selected move has no power.
- [ ] Damage includes the required generation V+ inputs and STAB.
- [ ] Type effectiveness uses API damage relations for both defender types.
- [ ] The UI exposes hit, miss, no effect, not very effective, and super
  effective outcomes.
- [ ] The battle log labels actions as belonging to the player or opponent and
  records the winner.
- [ ] The opponent attack has a short readable delay, and damaged Pokémon show
  a damage effect.
- [ ] The final outcome bar is green for a player win and red for a player loss.
- [ ] Each attack shows a damage or miss popup on the target, with a reserved
  larger/different critical-hit style while critical hits remain out of scope.
- [ ] The winner is determined when HP reaches zero.
- [ ] Completed battles persist in SQLite and have a history screen with an
  empty state.

## Project-wide technical coverage

- [ ] Battle navigation adds at least the required battle and history screens
  without breaking existing routes.
- [ ] TanStack Query owns server-state loading, caching, and retry behavior.
- [ ] UI, API access, persistence, and battle calculation logic are separated.
- [ ] Every API/database load has loading, error, retry, and success states.
- [ ] At least one native feature is used by the app and documented in
  `specs/product.md`; battle does not silently replace that product decision.
- [ ] Controls have accessible labels and remain usable with large text.
- [ ] Battle logic has unit tests for damage, accuracy, STAB, type
  effectiveness, Speed ordering, ties, victory, and history serialization.
- [ ] `npx expo lint` and `npx tsc --noEmit` pass without errors.
- [ ] The app starts in Expo Go from a clean install and the battle can be
  tested on a physical device.

## Decisions required before implementation

- [ ] Update `specs/product.md` to state whether this project is pursuing the
  battle-simulator route or adding battle as an extension of the current
  Pokedex product.
- [ ] Document the chosen battle/history navigation labels and the visual
  design direction.
- [ ] Confirm the native feature choice in `specs/product.md`.
- [ ] Create one GitHub issue per feature spec and require the implementation
  plan as the first issue comment.
- [ ] Keep exported chat history for at least one issue, including review and
  correction.
