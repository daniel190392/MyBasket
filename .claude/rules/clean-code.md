# Clean code (all platforms)

Write code as a senior engineer would: simple, readable, and easy to change.

## Language

- All code is written in **English**: identifiers, comments, commit messages, documentation inside the code, and user-facing string keys.
- Conversation with the user stays in Spanish (see `CLAUDE.md`).

## Principles

- Names reveal intent. Avoid abbreviations, single letters (except trivial loop indices) and generic names like `data`, `info`, `manager`, `helper`.
- Functions do one thing, stay small, and have few parameters. Prefer early returns over deep nesting.
- Single responsibility per file, class and component. Split when a file mixes concerns.
- No duplicated logic: extract it when the third repetition appears, not before.
- No dead code, commented-out code, unused imports or leftover debug logs (`console.log`, `println`, `print`).
- No magic numbers or strings: use named constants or theme tokens.
- Comments explain **why**, not what. If a comment explains what, rename or extract instead.
- Handle errors explicitly. Never swallow exceptions silently.
- Prefer immutability and pure functions. Avoid shared mutable state.
- Do not add abstractions, parameters or features "just in case". Solve the current requirement.
- Keep the change focused: do not refactor unrelated code in the same change.
