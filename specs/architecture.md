# Hero Key - Architecture

## Frontend

- React native.
- TypeScript.
- ESLint.

## Project organization

- src/app/ - Screens and navigation.
- src/components/ - Reusable UI components.
- src/lib/ - Shared utilities and business logic.
- assets/ - Images, icons, fonts, and other static assets.
- spec/ - Specifications.

## Rendering

React Native components are rendered on the client.

Use React Native APIs for device-specific functionality when required.

Keep components focused and reusable.

## Data

The pokemon data is fetched from the public PokeAPI (https://pokeapi.co/).

## Testing

The project SHOULD include:

- Unit tests for utilities and business logic.
- Component tests for interactive features.
- End-to-end tests for important user flows.

## Code quality

The project MUST pass ESLint.

The project MUST pass TypeScript checks.

The project SHOULD remain compatible with React Compiler.
