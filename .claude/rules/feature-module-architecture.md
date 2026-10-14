---
paths:
  - "modules/feature/**"
---

# Architecture: feature modules

Applies to every module under `modules/feature/` (the `feature` family; e.g. `feature-home`). A feature module owns a **business capability** as one embeddable unit: its screens, its internal navigation, its state and the contract with its data source. It is not a design system library: do not apply `.claude/rules/design-system-library-architecture.md` here, and do not use the `ui-` prefix.

## Context: brownfield

MyBasket is a **brownfield** app: the native host (`apps/host-*`) owns the app and its navigation between screens, and React Native features are embedded in it one at a time, as the native screens they replace are migrated. A feature is therefore not an app: it is a unit the host opens, gives some initial data and gets events back from. Nothing in this rule assumes a single React Native root that coordinates the app.

## Why this architecture

The rule is built on real references, grouped by the question each one answers. What no reference covered is listed under *Known gaps*.

**The boundary between the host and a feature** (brownfield sources):

- **Callstack `react-native-brownfield`, guidelines**: the native app should never use React Native APIs directly; the RN side is packaged behind a facade (`initialize`, `createView(moduleName, launchOptions, eventHandler)`), and the native side receives events and decides how to navigate. Adopted: a feature is one entry point with initial props and outgoing events.
- **Callstack, navigation in brownfield apps**: an alternative to loose events is a typed navigation contract that the native team implements. Deferred: events first, a contract when the native screens justify it.
- **React Native docs, integration with existing apps**: one component per native container, with initial properties. They do not cover navigation or several entry points.
- **Zalando (webinar recap, thin source)**: screens migrated one by one; RN as a self-contained SDK that reaches the native layers through dependency injection. Adopted: native capabilities are ports the host injects.

**Navigation inside a feature**:

- **React Navigation docs**: minimize nesting; nest to get the UI you want, not to organize code; an independent container (`NavigationIndependentTree`) is an advanced case, described for "a mini-app inside a larger app". A feature embedded in a native host is exactly that case.

**The inside of a feature** (real React Native apps and a reference architecture):

- **Bluesky `social-app`** (`src/features/<name>`), **Mattermost mobile** (`app/products/<name>`) and **bulletproof-react**: a feature is a folder with its screens, components, hooks, data access and types; tests sit next to the code; features do not import each other; code flows from shared to features to the app, and bulletproof enforces it with ESLint `import/no-restricted-paths`.
- **Expensify, over-engineering philosophy**: solve only the stated problem. This is why the layers below are added when needed, not up front.

**Kept from `auth-flow`** (project decision, not a public reference): ports with a shared in-memory mock, typed errors and pure validation, because they let the feature run and be tested without the backend or the device.

## Naming convention

- Modules are named `feature-<name>` (kebab-case), e.g. `feature-home`.
- The module depends on `ui-components` **by name with a semver range** (never a relative path) and uses its tokens and `P*` components for all UI.
- It never depends on another feature module, nor on `auth-flow`. What it needs from the session (a user id, a token provider) comes in through its props or a port.

## The boundary with the host

1. **A feature is one entry point.** `src/index.ts` exports one root component (for example `HomeNavigator`) plus its props and event types as soon as it has any; do not declare a prop or an event nobody uses yet. The host registers it under a module name and opens it; the feature does not know the host, the native screens or other features.
2. **Initial data comes in as props.** Props are typed (`<Feature>Props`) and serializable, because they cross the native boundary as a `Bundle` or a dictionary: ids, flags and configuration, never functions or entities. The same props carry a deep link target when the host decides the feature must open on a given screen; the feature does not register URL schemes.
3. **Leaving the feature is an event.** The feature declares a typed set of outgoing events (`onExit`, `onAddToCart`, ...) as callback props. It never navigates to another module or to a native screen, and never calls a native navigation module itself: the host (or the registration code next to it) turns an event into native navigation. Upgrade to a generated navigation contract only when the number of native destinations makes events unwieldy.
4. **Native capabilities are ports the host injects.** Storage, camera, notifications and the backend are interfaces defined by the feature (in `domain/`); the host provides the adapter. The feature never imports a platform module directly.
5. **No exclusive ownership of the React Native instance.** Several features can share one runtime: no module-level singletons that assume one active feature, and every listener or subscription is cleaned up on unmount.

## Navigation inside the feature

React Navigation (`@react-navigation/native`, `native-stack`, `bottom-tabs`) is the approved library. `native-stack` renders native controllers through `react-native-screens`, so the iOS swipe-back and the Android back button come without extra code. Do not add another navigation library, nor hand-roll tabs or a stack with React state.

1. **The feature owns its container.** The root component renders a `NavigationContainer` wrapped in `NavigationIndependentTree`, so the tree is independent of the host and of any other embedded feature. This is the use the docs describe for an app inside a larger app.
2. **Keep the nesting shallow.** A stack that contains tabs is the pattern for screens pushed above a tab bar; do not go beyond it, and never nest a navigator inside one of the same type.
3. **Navigation never leaks.** The `navigation` object and the route names stay inside the feature. The host sees only the props and events of the boundary.
4. **Route param lists are typed** (`HomeTabParamList`, `HomeStackParamList`) and read through typed hooks. Params carry ids, not whole entities: the screen reads the entity from the state.
5. **Screens stay presentational.** Deciding which route comes next belongs to the navigator wiring, not to a component deep in the tree.
6. **Tab bar and headers use the design tokens** (`colors`, `spacing`, `textPresets`) through the navigator options; no default platform colors.
7. **Back on the first screen belongs to the host.** At the root of the feature the feature emits its exit event instead of closing anything itself. How hardware back and the swipe gesture are handed over is decided when the host integration is built (see *Known gaps*).
8. **Deep links into a feature's inner screens and state restoration** are not part of the base. When one is needed, stop and ask.
9. **The native dependencies of navigation are `peerDependencies`** (`react-native-screens`, `react-native-safe-area-context`, the `@react-navigation/*` packages). The host installs them and autolinking registers them; the module also lists them as `devDependencies` for its tests and example.

## Structure inside the feature

Start flat and add a folder only when it has content; none of them is mandatory.

```
src/
  index.ts          public API: root component, props and event types
  navigation/       <Name>Navigator.tsx, param lists, typed hooks
  screens/          <Screen>.tsx and strings.ts; a screen gets its own <Screen>/ folder when it grows a hook or components used only by it
  components/       components shared by several screens of the feature
  state/            providers, hooks and reducers, only for state shared across screens
  domain/           types, pure rules, validation, errors and the ports
  api/              adapters of the ports (remote, persistent)
  testing/          in-memory adapters (not exported, not built)
example/            App.tsx, index.ts, metro.config.js, app.json, package.json, package-lock.json, assets/
```

- **Tests sit next to the code** in a `__tests__/` folder; `builder-bob` already excludes them from the build.
- **Dependencies flow one way**: `screens` and `components` use `state` and `domain`; `state` uses `domain`; `api` implements the ports of `domain`; `domain` imports nothing from the other folders and nothing from `react` or `react-native`. No folder imports from `screens`.
- **No barrels inside the feature**: import files directly. Only `src/index.ts` is a public surface.
- **Do not add layers up front.** A service class, a reducer or an injected clock appear when a screen needs them, not because the structure has a place for them.
- **Do not add a state library or a form library** without explicit approval. Server-state libraries such as TanStack Query (used by Bluesky) are a decision to take with the first real data source.

## Rules

1. **Screens never talk to the data source.** They use hooks and render their state. No `fetch`, no adapter calls and no storage access inside `screens/`.
2. **The data source is a port** declared in `domain/`. Switching from the mock to a persistent or remote source means writing one adapter in `api/` and injecting it; no screen changes.
3. **Dependencies are injected, not imported.** Nothing in `state/` or `screens/` imports a concrete adapter; the entry point receives or builds them.
4. **One shared mock, kept out of the public API.** It lives in `testing/`, is not exported and is excluded from the build (`exclude` in `builder-bob`, `!src/testing` in `files`). The example and the tests import it by relative path. Defaults serve the example, options serve the tests.
5. **Typed, platform-agnostic errors.** The domain throws errors with a stable `code`; the UI maps the code to a message and never shows raw backend text.
6. **Derived data is computed, not stored.** Filtering, grouping and badges are pure functions in `domain/`. Anything that depends on "now" receives the date as an argument; never call `new Date()` inside a rule, so tests can use fixed dates.
7. **No secrets in code**; follow `.claude/rules/security.md`. Sample data in the mock is obviously fake.
8. **Validation lives in `domain/`** as pure functions returning field errors; the screen only displays them.
9. **UI uses tokens and `P*` components only.** No hardcoded colors, spacing or font sizes. If a needed generic component is missing (chip, icon, floating button), add it to `ui-components` instead of working around it. Components that only make sense for this feature (a product row) stay in the module.
10. **Minimal, stable public API.** Everything public is exported from `src/index.ts`; consumers do not deep-import.
11. **User-facing text lives in one `strings` file** per screen group. Keys and identifiers are in English; the values are in the app's display language, which follows the design reference (Spanish), as in `auth-flow`.
12. **A module is runnable on its own.** It ships an `example/` from the first commit (see *Showcase app*), and the logic in `domain/`, `api/` and `state/` has unit tests (Jest).

## Showcase app (`example/`)

An Expo app that renders the feature without the host, so it can be tried and verified independently. Start it from the `auth-flow` example (`package.json`, `app.json`, `tsconfig.json`, `index.ts`, `.gitignore`, `assets/`, `metro.config.js`) and adapt it:

- It is not an npm workspace: it has its own `package.json`, `node_modules` and committed `package-lock.json`. Rename it `<module>-example`.
- `App.tsx` imports the module from `../src` (not from `lib/`), so it needs no build step, and passes the props the host would pass.
- Native packages the module uses (`react-native-screens`, `react-native-safe-area-context`) are installed in the example with `npx expo install`, so they match the versions Expo's runtime ships. Add them to `SINGLETON_PACKAGES` in its `metro.config.js`, together with `react` and `react-native`, so Metro resolves one copy from the example instead of the one hoisted at the repo root; two native versions crash at runtime.
- The example pins older `react` / `react-native` versions than the module; the module's `peerDependencies` declare the minimum.

## Scaffolding order

`npm install` at the repo root runs `prepare` (the build) in every workspace, so a module whose code does not compile aborts the whole install and leaves its dependencies missing; the errors then point at the code, not at the real cause. To avoid it:

1. Create `package.json` and the configs with a placeholder `src/index.ts` (`export {};`).
2. Run `npm install` from the repo root.
3. Only then write the code that imports the new dependencies.

Before calling a scaffold done, all of this passes: `npx tsc --noEmit` and `npm run build` in the module, `npx tsc --noEmit` in `example/`, and `npx expo export --platform android` in `example/` (it proves Metro resolves everything). Say explicitly that it was not run on a device if it was not. Screens that are not built yet may be placeholders in the skeleton, and each one is replaced when its screen is built. The module also gets its `README.md`, an entry in the root `CLAUDE.md` and `README.md`, and `jest --passWithNoTests` as its `test` script until the first test exists.

## Known gaps

No reference reviewed settles these; each is decided when the host integration is built, and this rule is updated then.

- **Events versus a generated navigation contract** for leaving a feature (events first; Callstack's contract is the next step).
- **Hardware back and swipe gesture at the first screen** of a feature: who consumes them. Callstack's library mentions enabling and disabling native gestures and hardware buttons from JavaScript; not verified.
- **State shared with native screens beyond the token** (Callstack's Brownie is one option; its docs note some latency in the exchange).
- **How the host registers several features** and whether they share one React Native instance in practice.
- **Session across several React Native roots.** Each root is a separate React tree, so a context provider in one root is not visible in another. The expected answer is one plain-TypeScript service instance built in the host's JS and wrapped by a provider in each root; it is an inference from how React Native behaves, not tested in this project.
- **Lint enforcement of the import boundaries** (`import/no-restricted-paths`, as in bulletproof-react), once the repo has ESLint.
- **Packaging the React Native side** as one artifact with a facade (an AAR and an XCFramework), as the Callstack guidelines recommend, so that the native hosts stop importing React Native APIs.

## Build output

- `lib/` is generated by `npm run build` (`tsc` + `react-native-builder-bob`) and is git-ignored. Never edit it by hand.
