# Architecture reference

Read this file only when a task crosses component, state, API, or persistence boundaries.

## Runtime flow

1. `src/main.tsx` mounts `App`.
2. `src/App.tsx` owns the query, search mode, latest results, loading/error state, and library drawer visibility.
3. `src/services/booksApi.ts` calls Open Library and maps external records to `Book`.
4. `src/hooks/useLibrary.ts` owns saved books, derived library sections, synchronization, and localStorage.
5. Components render forms, cards, recommendations, and library sections through typed props.

## Data boundaries

- `searchResults` contains only the latest API search and is not persisted.
- `libraryBooks` contains books with personal data and is persisted under `personal-reading-tracker-books`.
- A book may appear in one reading-status section and in favourites simultaneously.
- Search merging must copy only `status`, `isFavorite`, and `rating` from storage onto fresh API metadata.

## External data

- Search uses Open Library `search.json` with a 12-result limit.
- Recommendations select a subject, request up to 20 records, keep covered books, and display up to 12.
- Network requests and component cleanup use `AbortController`.
- Runtime validation protects the app because TypeScript does not validate fetched JSON.

## Server boundary

- `server/` is an independent Node prototype with hard-coded routes.
- It is not part of the root Vite build and the frontend does not call it.
- Backend work must define API shape, CORS/proxy behavior, persistence, and migration away from direct Open Library calls before integration.

## Verification map

- UI/layout: responsive states, keyboard labels, loading/error/empty views.
- Library: save, reload, status transitions, rating reset, favourite overlap, removal, reset.
- API: title/author URLs, mapping fallbacks, malformed data, errors, aborts.
- Baseline commands: `npm run lint`, then `npm run build`.
