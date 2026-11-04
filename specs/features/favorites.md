# Feature: favorites

## Purpose

To allow users to save Pokemon they are interested in and access them quickly from a dedicated favorites page.

## Requirements

### FR-FAV-001 - Favorites page

The application MUST provide a dedicated page for the user's favorite Pokemon.

### FR-FAV-002 - Save Pokemon

The user MUST be able to save a Pokemon as a favorite.

### FR-FAV-003 - Remove Pokemon

The user MUST be able to remove a Pokemon from their favorites.

### FR-FAV-004 - Favorite list

The favorites page MUST display saved Pokemon with their name, type, and image.

### FR-FAV-005 - Pokemon selection

The user MUST be able to select a favorite Pokemon and open its detailed view.

### FR-FAV-006 - Persistent favorites

Favorites SHOULD remain saved when the application is closed and opened again.

### FR-FAV-007 - Empty favorites

The application MUST display a clear message when the user has no favorite Pokemon.

## Acceptance criteria

- The favorites page displays all saved Pokemon.
- Each favorite displays its name, type, and image.
- Users can remove Pokemon from their favorites.
- Selecting a favorite opens its detailed view.
- Favorites remain available after restarting the application.
- An appropriate empty state is displayed when there are no favorites.
