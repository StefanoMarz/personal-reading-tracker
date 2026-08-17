---
name: develop-reading-tracker
description: Develop, debug, review, or explain the Personal Reading Tracker repository. Use for React or TypeScript changes, Open Library integration, localStorage library behavior, book status/rating/favourite logic, responsive UI work, build failures, and work that may affect the separate server prototype.
---

# Develop Reading Tracker

## Work with minimal context

1. Classify the task as UI-only, state/persistence, API, build/tooling, or server work.
2. Search for the owning symbol with `rg`; read only its direct callers, types, and tests if present.
3. Read [references/architecture.md](references/architecture.md) only for cross-cutting flows, persistence/API invariants, onboarding, or server integration.
4. Prefer the smallest change that preserves current behavior outside the request.

## Preserve ownership boundaries

- Keep page orchestration and transient search state in `src/App.tsx`.
- Keep library rules and browser persistence in `src/hooks/useLibrary.ts`.
- Keep Open Library requests, cancellation, validation, and mapping in `src/services/booksApi.ts`.
- Keep shared domain values in `src/types/book.ts` and UI rendering in `src/components/`.
- Do not make the frontend depend on `server/` unless backend integration is explicitly requested.

## Preserve domain invariants

- Keep search results separate from saved library books.
- Persist only books with personal data: status, favourite, or rating.
- Allow ratings from 0 to 5 only when status is `read`.
- Clear the rating when a book stops being `read`.
- Keep favourite membership independent from reading status.
- Merge saved personal fields into fresh API results without replacing fresh bibliographic metadata.
- Treat API and localStorage data as untrusted runtime input.

## Use subagents economically

- Stay single-agent for clear, local changes.
- Use `code_mapper` only when a flow crosses several unfamiliar files.
- Use `reviewer` after medium/high-risk changes or when the user asks for a bug audit.
- Use `verifier` only when check output is large enough to pollute the main context; otherwise run checks directly.
- Return distilled subagent conclusions and discard raw exploration from the main response.

## Verify proportionally

- Run `npm run lint` and `npm run build` after React or TypeScript changes.
- For API changes, check success, malformed responses, failures, and cancellation where practical.
- For persistence changes, check reload, corrupt stored data, status/rating transitions, favourites, and reset.
- The repository currently has no automated test command; never report tests as passed unless one is added and run.
- Report what was verified and any remaining manual check.
