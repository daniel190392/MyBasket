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
  data/                  Access to the backend (TypeScript only, no native code)
    api-client/          HTTP client: Bearer token, typed errors
  feature/               Business features
    feature-home/        Home feature in React Native: product list, favorites, add product (own navigation)
metro.config.js        Monorepo Metro config (projectRoot = apps/host-android)
```

The folders under `modules/` are **families**. The first version is a monorepo, but each family is meant to become its own repository later, and each host (`apps/host-*`) too. Until then, keep the boundaries clean: packages depend on each other by name with a semver range (not `file:` or relative paths) and never import across families through relative paths.

### `modules/ui/ui-components`

UI library with the `P` prefix (`PButton`, `PCard`, `PBadge`, `PInput`, `PLink`, `PIcon`, `PChip`, `PFab`, `PIconButton`) and a theme (`colors`, `spacing`, typography, borders, shadows, `textPresets`). Built with `react-native-builder-bob` (`module` and `commonjs` targets, types via `tsc`) into `lib/`.

- Source code: `src/components` and `src/theme`; everything is exported from `src/index.ts`.
- `example/` is an Expo showcase app with one screen per component.
- Build: `npm run build` inside the module.

### `modules/auth/auth-flow`

Authentication module in React Native + TypeScript, built with `react-native-builder-bob` like the UI libraries. A small ports-and-adapters core behind a thin React layer: `domain` (types, `AuthError`, the `AuthProvider` and `SessionStorage` ports, validation), `data` (`RemoteAuthProvider`), `application` (`AuthService`, session reducer, `AuthSessionProvider`, `useAuth`) and `presentation` (screens and the `SignUpFlow` / `PasswordRecoveryFlow` flows). UI comes from `ui-components` (peer dependency).

- The host builds `new AuthService(provider, storage)` once and passes it to `AuthSessionProvider`. A different backend means writing an `AuthProvider` adapter in `data/` and swapping it there.
- The shared mock (`MockAuthProvider`, `InMemorySessionStorage`) lives in `src/testing/`: it is not exported nor built, and the example and the tests import it by relative path. Demo credentials are in `DEFAULT_MOCK_USERS`. Unit tests: `npm test` inside the module.
- `example/` is an Expo showcase running against the mock. Build: `npm run build` inside the module.
- Architecture rule: `.claude/rules/auth-module-architecture.md`; scaffold new auth modules with the `create-auth-module` skill.

### `modules/data/api-client`

Single `fetch` wrapper that every feature uses to reach the backend: `createApiClient({ baseUrl, getAccessToken })` returns `request<T>(path, { method, body })`. It sends the access token as Bearer, parses JSON and maps every failure to an `ApiError` with a stable `code` (it reads both backend error shapes, `error` and `message`). It does not depend on `auth-flow`: the host passes `() => authService.getAccessToken()`. The 401 retry and the backoff on 5xx are not built yet (see its README).

- Tests: `npm test` inside the module. Build: `npm run build`.

### `modules/platform/secure-storage`

React Native TurboModule with native code inside (`android/` in Kotlin; `ios/` will be added with the iOS host). It exposes `secureStorage` with `getItem`, `setItem` and `removeItem`: values are encrypted with an AES-GCM key that never leaves the Android Keystore and kept in private SharedPreferences. It is generic and does not depend on `auth-flow`.

- `src/NativeSecureStorage.ts` is the contract: codegen turns it into the native base class that the Kotlin module extends. `src/index.ts` exports `secureStorage` and the `SecureStorage` type.
- The host links it by depending on it (autolinking registers the package); it needs no Gradle change.
- Keys are shared by every module that uses the store, so they carry a module prefix (`auth.session`).
- `auth-flow` does not import it: it declares a `KeyValueStore` port, and the host passes `secureStorage` to `new SecureSessionStorage(...)`.
- Build: `npm run build` inside the module.

### `modules/feature/feature-home`

Home feature in React Native + TypeScript, built with `react-native-builder-bob` like the other modules. The app is a brownfield migration, so a feature is one embeddable entry point for the native host: `HomeNavigator` owns its internal navigation (React Navigation, `native-stack` + `bottom-tabs`, in its own `NavigationContainer` inside a `NavigationIndependentTree`) and the host does not know the routes. The products screen is built from the design (search, category chips, products grouped into "Por caducar" and the rest, favorite star, add button); favorites is a placeholder. The add product form (category chips, name, quantity with unit, date typed as DD/MM/YYYY) is validated in `domain/productForm.ts` and creates through `ProductRepository.create`. The data comes through a `ProductRepository` port (in `domain/`) that the host passes to `HomeNavigator` as a prop; the in-memory mock lives in `src/testing/` and the host adapts the backend products in `src/home/` (`ApiProductRepository` over `api-client`; favorites are not stored by the backend, so toggling one is rejected and the star goes back). Expiration status, filtering and grouping are pure functions in `domain/` with Jest tests (`npm test` inside the module). The native dependencies of navigation are peer dependencies that the host installs.

- `example/` is an Expo showcase that renders `HomeNavigator` without the host.
- Architecture rule: `.claude/rules/feature-module-architecture.md`.
- Build: `npm run build` inside the module.

### `apps/host-android`

Native Android app organized as a brownfield host: native destinations that each show one React Native root, registered by name in `index.js`. `AuthActivity` is the launcher and shows `AuthRoot` (the auth flow, which restores the session first). When the session is open it reports `signedIn` and the `NavigationCoordinator` starts `HomeActivity`, which shows `HomeRoot` (`feature-home`), and finishes the previous activity, so back from the home leaves the app. `HomeRoot` reports `signedOut` when the session ends and the coordinator returns to the login. Roots report to native through `HostEvents`, a TurboModule the host owns (`report(event)`; the events are defined in `HostEvent.kt` and `src/native/hostEvents.ts` and must change together). Every root is a separate React tree, so they share one `AuthService` instance built in `src/auth/sharedAuthService.ts`. `HomeRoot` shows a temporary sign-out bar until the native profile screen exists. The host consumes `ui-components`, `auth-flow`, `secure-storage`, `api-client` and `feature-home` (dependency `^1.0.0`, linked by the npm workspace). `HomeRoot` builds one `api-client` (with `authService.getAccessToken`) and the product repository from the `api.baseUrl` setting in `local.properties` (https only, refused otherwise); the mapping of backend products is in `src/home/productMapping.ts` with Jest tests (`npm test` in that folder). Metro is started with `npm start` in that folder.

The host applies the React Native Gradle plugin, so `react-android` and `hermes-android` take their version from `package.json`, and it runs on the New Architecture. The plugin needs a JDK 17 installed (for example in `~/.jdks`); the toolchain is Gradle 9.0.0 and AGP 8.12.0.

## Stack

- React 19.1 + React Native 0.82 across the root, the host and the modules (`upgrade-react-native` skill to bump them). The Expo example apps pin their own, older versions and set the minimum the `peerDependencies` declare.
- `react-native-screens` is pinned to 4.25.x by `overrides` in the root `package.json`: 4.26+ needs React Native 0.84.
- TypeScript
- Android: Gradle (Kotlin DSL)

## Conventions

- Prettier: semicolons, single quotes, `trailingComma: es5`, 80 columns, 2 spaces.
- UI component names use the `P` prefix.
- Commits in English, short messages in past tense ("Added PLink").
- Project-specific rules and skills live in `.claude/rules/` and `.claude/skills/`.
