# Feature: pokeapi

## Purpose

To provide the Pokedex application with Pokemon data using the public PokeAPI.

## API

The application MUST use the PokeAPI as its external data source.

Base URL:

`https://pokeapi.co/api/v2`

## Requirements

### FR-API-001 - Pokemon data

The application MUST retrieve Pokemon data from the PokeAPI.

The application MUST be able to retrieve:

- Pokemon name.
- Pokemon image.
- Pokemon types.
- Pokemon abilities.
- Pokemon base stats.

### FR-API-002 - Pokemon list

The application MUST use the Pokemon endpoint to retrieve Pokemon for the homepage and search results.

### FR-API-003 - Pokemon details

The application MUST retrieve the required data for an individual Pokemon from the PokeAPI.

### FR-API-004 - Pokemon types

The application MUST retrieve Pokemon type information from the PokeAPI.

### FR-API-005 - Evolution data

The application MUST retrieve evolution information using the PokeAPI evolution chain data.

### FR-API-006 - Search

The application MUST use PokeAPI data to support searching for Pokemon by name.

The application SHOULD support partial name matching by filtering the available Pokemon data when the API does not provide a direct partial-search endpoint.

### FR-API-007 - API errors

The application MUST handle API request failures gracefully.

The application MUST display an appropriate error state when required data cannot be retrieved.

### FR-API-008 - Loading states

The application MUST display an appropriate loading state while waiting for API data.

### FR-API-009 - API data handling

API responses MUST be converted into application-specific TypeScript types before being used throughout the UI where practical.

API-specific response structures SHOULD NOT be unnecessarily exposed throughout the component layer.

## Acceptance criteria

### AC-API-001 - Pokemon data

The application can retrieve and display Pokemon data from the PokeAPI.

### AC-API-002 - Pokemon list

The homepage can retrieve and display a list of Pokemon from the API.

### AC-API-003 - Pokemon details

Selecting a Pokemon retrieves and displays its detailed information.

### AC-API-004 - Types

Pokemon types are retrieved correctly and displayed in the application.

### AC-API-005 - Abilities and stats

The detailed view displays the Pokemon's abilities and base stats using data from the API.

### AC-API-006 - Evolutions

The detailed view displays the Pokemon's evolution chain using data from the API.

### AC-API-007 - API failure

If an API request fails, the application displays an appropriate error state instead of crashing.

### AC-API-008 - Loading

The application displays a loading state while API data is being retrieved.

### AC-API-009 - Type safety

API data used by the application is handled using TypeScript types.
