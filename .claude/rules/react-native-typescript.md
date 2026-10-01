---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
---

# React Native + TypeScript conventions

## Naming

- Components, types, interfaces, enums: `PascalCase`. Component files match the component name (`PButton.tsx`).
- UI library components in `ui-components` use the `P` prefix (`PButton`, `PCard`).
- Variables, functions, props, hooks: `camelCase`. Hooks start with `use` (`useExpiringProducts`).
- Constants: `UPPER_SNAKE_CASE` for true constants, otherwise `camelCase`.
- Boolean names read as questions: `isLoading`, `hasExpired`, `canSubmit`.
- Event handler props start with `on` (`onPress`); handler implementations start with `handle` (`handlePress`).
- Prop types named `<Component>Props` (`PButtonProps`).

## Code

- TypeScript strict. No `any`; use `unknown` and narrow, or define the type. Avoid non-null assertions (`!`).
- Function components only, with hooks. No class components.
- Type props explicitly; prefer `type` for props and unions, `interface` for extendable object contracts.
- Keep components presentational when possible; move logic to hooks and utilities.
- Styles with `StyleSheet.create` at the bottom of the file, using theme tokens (`colors`, `spacing`, typography) instead of hardcoded values.
- Do not define components or styles inside render. Memoize (`useMemo`, `useCallback`, `React.memo`) only when there is a measured or obvious need.
- Export public API from the module's `index.ts`; do not deep-import across modules.
- Formatting follows `.prettierrc` (single quotes, semicolons, 80 columns, 2 spaces).
