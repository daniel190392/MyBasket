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
  ui/                    Design system libraries (one package each, own example app)
    ui-components/       Component library and theme in React Native + TypeScript
    ui-animation/        Animation components that consume the ui-components tokens
  auth/                  Authentication flow and session (planned, empty for now)
  feature/               Business features
    feature-home-flutter/  Flutter module for Home (empty for now)
metro.config.js        Monorepo Metro config (projectRoot = apps/host-android)
```

The folders under `modules/` are **families**. The first version is a monorepo, but each family is meant to become its own repository later, and each host (`apps/host-*`) too. Until then, keep the boundaries clean: packages depend on each other by name with a semver range (not `file:` or relative paths) and never import across families through relative paths.

### `modules/ui/ui-components`

UI library with the `P` prefix (`PButton`, `PCard`, `PBadge`, `PInput`, `PLink`) and a theme (`colors`, `spacing`, typography, borders, shadows, `textPresets`). Built with `react-native-builder-bob` (`module` and `commonjs` targets, types via `tsc`) into `lib/`.

- Source code: `src/components` and `src/theme`; everything is exported from `src/index.ts`.
- `example/` is an Expo showcase app with one screen per component.
- Build: `npm run build` inside the module.

### `apps/host-android`

Native Android app that loads React Native. `index.js` registers the `UIComponentsView` component, which consumes `ui-components` (dependency `^1.0.0`, linked by the npm workspace). Metro is started with `npm start` in that folder.

The host applies the React Native Gradle plugin, so `react-android` and `hermes-android` take their version from `package.json`, and it runs on the New Architecture. The plugin needs a JDK 17 installed (for example in `~/.jdks`); the toolchain is Gradle 9.0.0 and AGP 8.12.0.

## Stack

- React 19.1 + React Native 0.82 across the root, the host and the modules (`upgrade-react-native` skill to bump them). The Expo example apps pin their own, older versions and set the minimum the `peerDependencies` declare.
- TypeScript
- Android: Gradle (Kotlin DSL)
- Flutter planned for `feature-home-flutter`

## Conventions

- Prettier: semicolons, single quotes, `trailingComma: es5`, 80 columns, 2 spaces.
- UI component names use the `P` prefix.
- Commits in English, short messages in past tense ("Added PLink").
- Project-specific rules and skills live in `.claude/rules/` and `.claude/skills/`.
