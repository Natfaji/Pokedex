# Feature: search-results

## Purpose

To allow users to view and navigate through Pokemon that match their search criteria.

## Requirements

### FR-SR-001 - Search results

The application MUST display Pokemon matching the user's search query.

### FR-SR-002 - Partial matches

The search MUST support partial name matches and MUST NOT require an exact Pokemon name.

### FR-SR-003 - Type results

The search MUST return Pokemon matching the selected or entered Pokemon type.

### FR-SR-004 - Result information

Each search result MUST display the Pokemon's name, type, and image.

### FR-SR-005 - Pokemon selection

The user MUST be able to select a search result to open the Pokemon's detailed view.

### FR-SR-006 - No results

The application MUST display a clear message when no Pokemon match the search criteria.

### FR-SR-007 - Search query

The search results page MUST display or otherwise indicate the current search query.

## Acceptance criteria

- A search displays matching Pokemon.
- Partial Pokemon names return relevant results.
- Type searches return Pokemon of the requested type.
- Each result displays the Pokemon's name, type, and image.
- Selecting a result opens the corresponding detailed view.
- A clear message is shown when no results are found.
- The user can perform another search from the search results page.
