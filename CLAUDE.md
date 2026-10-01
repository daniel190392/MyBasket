# MyBasket

Mobile app under development, organized as a monorepo (npm workspaces). React Native screens and components are built as reusable modules that are embedded in native host apps.

## What the app is

A household supplies basket: a list of the products kept in stock, with their expiration dates, to avoid them going bad.

- **Iteration 1**: product inventory with expiration date tracking.
- **Iteration 2**: a kitchen feature that suggests dishes to prepare with the available products, prioritizing those closest to expiring.

## Project goal

Personal learning project. The focus is architecture, not the product:

- Create a native **host app** that integrates React Native modules (and Flutter later) to test how apps integrate and communicate with each other.
- Learn **React Native architecture**, **Kotlin on Android** and **Swift on iOS**.

## Structure

```
apps/
  host-android/        Native Android app (Kotlin/Gradle) that hosts React Native views
  host-ios/            Native iOS app (empty for now)
modules/
  ui-components/       Component library and theme in React Native + TypeScript
  feature-home-flutter/  Flutter module for Home (empty for now)
metro.config.js        Monorepo Metro config (projectRoot = apps/host-android)
```

### `modules/ui-components`

UI library with the `P` prefix (`PButton`, `PCard`, `PBadge`, `PInput`, `PLink`) and a theme (`colors`, `spacing`, typography, borders, shadows, `textPresets`). Built with `react-native-builder-bob` (`module` and `commonjs` targets, types via `tsc`) into `lib/`.

- Source code: `src/components` and `src/theme`; everything is exported from `src/index.ts`.
- `example/` is an Expo showcase app with one screen per component.
- Build: `npm run build` inside the module.

### `apps/host-android`

Native Android app that loads React Native. `index.js` registers the `UIComponentsView` component, which consumes `ui-components` (dependency `file:../../modules/ui-components`). Metro is started with `npm start` in that folder.

## Stack

- React 18 + React Native 0.74/0.76 (versions differ between workspaces; keep this in mind when upgrading)
- TypeScript
- Android: Gradle (Kotlin DSL)
- Flutter planned for `feature-home-flutter`

## Conventions

- Prettier: semicolons, single quotes, `trailingComma: es5`, 80 columns, 2 spaces.
- UI component names use the `P` prefix.
- Commits in English, short messages in past tense ("Added PLink").
- Project-specific rules and skills live in `.claude/rules/` and `.claude/skills/`.
