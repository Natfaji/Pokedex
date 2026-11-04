# Feature: favorites-storage

## Purpose

To persist the user's favorite Pokemon in a local SQLite-backed store so favorites survive application restarts.

## Storage

The native application MUST use `expo-sqlite` with a local SQLite database for favorite persistence.

The web application MAY use a platform-compatible fallback because Expo SQLite web support is alpha and is incompatible with the current static web worker serializer.

The favorites database MUST contain a `favorites` table with the Pokemon id, name, image URL, type data, and creation timestamp.

The storage layer MUST remain behind the application provider and MUST NOT be accessed directly by UI components.

Platform-specific storage implementations MUST expose the same favorites service API.

## Behavior

- The application MUST load saved favorites when the provider initializes.
- Saving or removing a favorite MUST update the SQLite-backed store.
- SQLite queries MUST use bound parameters for Pokemon data.
- The web fallback MUST preserve the same favorite behavior and persistence contract.
- A storage failure MUST leave the application usable and display the current in-memory favorite state.
- Favorite data MUST remain available after the application is closed and opened again.

## Acceptance criteria

- Favorites are read from the SQLite `favorites` table during application initialization.
- Adding a favorite persists the Pokemon summary.
- Removing a favorite persists the updated collection.
- Restarting the application restores the saved favorites.
- UI components do not import or call SQLite storage APIs directly.
