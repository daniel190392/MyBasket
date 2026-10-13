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
  auth/                  Authentication modules (one package each, own example app)
    auth-flow/           Login flow, session state and backend contract (mock + swappable provider)
  platform/              Device capabilities exposed to React Native (native code inside)
    secure-storage/      Encrypted key-value storage (Android Keystore, iOS Keychain later)
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

### `modules/auth/auth-flow`

Authentication module in React Native + TypeScript, built with `react-native-builder-bob` like the UI libraries. A small ports-and-adapters core behind a thin React layer: `domain` (types, `AuthError`, the `AuthProvider` and `SessionStorage` ports, validation), `data` (`RemoteAuthProvider`), `application` (`AuthService`, session reducer, `AuthSessionProvider`, `useAuth`) and `presentation` (screens and the `SignUpFlow` / `PasswordRecoveryFlow` flows). UI comes from `ui-components` (peer dependency).

- The host builds `new AuthService(provider, storage)` once and passes it to `AuthSessionProvider`. A different backend means writing an `AuthProvider` adapter in `data/` and swapping it there.
- The shared mock (`MockAuthProvider`, `InMemorySessionStorage`) lives in `src/testing/`: it is not exported nor built, and the example and the tests import it by relative path. Demo credentials are in `DEFAULT_MOCK_USERS`. Unit tests: `npm test` inside the module.
- `example/` is an Expo showcase running against the mock. Build: `npm run build` inside the module.
- Architecture rule: `.claude/rules/auth-module-architecture.md`; scaffold new auth modules with the `create-auth-module` skill.

### `modules/platform/secure-storage`

React Native TurboModule with native code inside (`android/` in Kotlin; `ios/` will be added with the iOS host). It exposes `secureStorage` with `getItem`, `setItem` and `removeItem`: values are encrypted with an AES-GCM key that never leaves the Android Keystore and kept in private SharedPreferences. It is generic and does not depend on `auth-flow`.

- `src/NativeSecureStorage.ts` is the contract: codegen turns it into the native base class that the Kotlin module extends. `src/index.ts` exports `secureStorage` and the `SecureStorage` type.
- The host links it by depending on it (autolinking registers the package); it needs no Gradle change.
- Keys are shared by every module that uses the store, so they carry a module prefix (`auth.session`).
- `auth-flow` does not import it: it declares a `KeyValueStore` port, and the host passes `secureStorage` to `new SecureSessionStorage(...)`.
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
