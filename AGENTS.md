# Personal Reading Tracker - Codex guidance

## Scope

- Treat `src/` as the production React application.
- Treat `server/` as a separate prototype; do not connect or expand it unless the user asks.
- Preserve uncommitted user changes and avoid unrelated cleanup.

## Context budget

- Start with `package.json` and only the files named by the task; use `rg` before broader reads.
- Use `$develop-reading-tracker` for implementation, debugging, review, or architecture work in this repository.
- Load its `references/architecture.md` only for cross-cutting state, persistence, API, or server work.
- Do not reread the full README during ordinary code changes.

## Subagents

- Prefer one agent for small or single-file tasks.
- Delegate only independent, read-heavy work that would otherwise add noisy logs or exploration to the main context.
- Use `code_mapper` for cross-cutting discovery, `reviewer` for risk review, and `verifier` for noisy checks.
- Normally use at most two subagents. The main agent owns edits; never let agents edit overlapping files.
- Ask subagents for concise conclusions with file references, not raw command output.

## Change and verification rules

- Keep changes focused and preserve the separation between search results and the personal library.
- Do not add dependencies unless the task clearly requires them.
- Run `npm run lint` and `npm run build` after TypeScript or React changes.
- State when automated tests are unavailable; do not claim unrun checks.
- Add comments only for non-obvious invariants, workarounds, or decisions.
