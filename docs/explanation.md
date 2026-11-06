# Implementation explanation

## 1. Technical choices

### Persistent data

Favorites are stored in SQLite so they remain available after an app restart.
The database setup and CRUD operations are in
[`src/services/favorites-db.native.ts`](../src/services/favorites-db.native.ts#L5),
line 5,
and the React state that uses it is in
[`src/lib/favorites-provider.tsx`](../src/lib/favorites-provider.tsx#L40).

Battle results use the same approach in
[`src/services/battle-history-db.native.ts`](../src/services/battle-history-db.native.ts#L25).

### Native feature

The detail screen uses the React Native share sheet. It is implemented with
`Share.share` at line 142 in
[`src/app/pokemon/[name].tsx`](../src/app/pokemon/[name].tsx#L142).
I chose sharing instead of haptics because a shareable Pokémon detail is useful
to the user and works on both mobile platforms.

### Server state

TanStack Query owns API loading, caching and error states in
[`src/lib/queries.ts`](../src/lib/queries.ts#L15). The API calls themselves are
separated into
[`src/lib/pokeapi.ts`](../src/lib/pokeapi.ts#L184).

### A choice that changed

The initial list and search implementation converted API name resources into
summary objects without types. I changed this so
`getPokemonListPage()` and `searchPokemon()` fetch full summaries. This adds
the type data needed by the list cards and keeps the UI independent from API
response details.

## 2. One feature from API to screen

The Pokémon detail flow starts in
[`src/app/(tabs)/index.tsx`](../src/app/(tabs)/index.tsx#L1), where a
`PokemonCard` navigates to `/pokemon/[name]`.

The route is implemented in
[`src/app/pokemon/[name].tsx`](../src/app/pokemon/[name].tsx#L35). It calls
`usePokemonDetails`, defined in
[`src/lib/queries.ts`](../src/lib/queries.ts#L51).

The hook calls `getPokemonDetails` in
[`src/lib/pokeapi.ts`](../src/lib/pokeapi.ts#L241). That service loads the
Pokémon, species, evolution chain and evolution summaries from PokeAPI, then
returns one typed `PokemonDetails` object. The screen renders the result in
the About, Stats and Evolution tabs. Evolution cards navigate to another
detail route.

## 3. Agent suggestion changed or rejected

The battle implementation was treated as an extension of the Pokédex instead
of replacing the Pokédex route. This is documented in
[`specs/product.md`](../specs/product.md). The implementation keeps the
Pokédex, compare and favorites flows while adding battle setup, fighting and
history routes.

The work was tracked in GitHub issue
[#1 Implement Pokémon Battle Mechanics](https://github.com/Natfaji/Pokedex/issues/1),
which is closed. A plan and review comment was added to the issue after
implementation. The repository also includes the example record in
[`chat-history/1.md`](../chat-history/1.md) for the required hand-in format.

Battle-engine tests are in
[`tests/battle-engine.test.ts`](../tests/battle-engine.test.ts) and run with
`npm test`.

## Bonus work

- Accessibility labels and disabled states are applied to interactive controls,
  including search, favorites, language selection, battle moves and retry
  actions.
- The repository runs lint, TypeScript, tests and an Expo web export on every
  push and pull request through
  [`.github/workflows/quality.yml`](../.github/workflows/quality.yml).
