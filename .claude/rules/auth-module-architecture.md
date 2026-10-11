---
paths:
  - "modules/auth/**"
---

# Architecture: auth modules

Applies to every module under `modules/auth/` (the `auth` family; e.g. `auth-flow`). An auth module owns the **authentication flow**: its screens, its state and the contract with the backend. It is a feature-like module, not a design system library: do not apply `.claude/rules/design-system-library-architecture.md` here, and do not use the `ui-` prefix.

## Why this architecture

Reference projects were analysed before choosing it:

- **Bluesky `social-app`**: the session lives in a provider plus a pure reducer, and the network clients are separate files. State, side effects and transport do not mix.
- **`react-native-auth0`**: a provider and a hook for components, the same logic exposed as a plain class for non-React code, a credentials manager hidden behind secure storage, and platform-agnostic typed errors.
- **Ignite / Obytes starters**: the backend is reached through one service layer and the screens never call `fetch` directly.

What they share is what this rule adopts: **a small ports-and-adapters core** (domain contracts, swappable adapters) behind **a thin React layer** (provider + hook + screens). Redux, react-query or a DI container are not needed at this size.

## Naming convention

- Modules are named `auth-<topic>` (kebab-case), e.g. `auth-flow`. The folder scopes this rule, so new modules in `modules/auth/` are covered automatically.
- The module depends on `ui-components` **by name with a semver range** (never a relative path) and uses its tokens and `P*` components for all UI.
- Two different "providers" exist; keep the names apart:
  - `AuthProvider`: the **port** (interface) to the backend. This is what is swapped between mock and real.
  - `AuthSessionProvider`: the **React component** that holds the session state and exposes it through `useAuth`.

## Layers

Dependencies flow in one direction only:

```
presentation  →  application  →  domain  ←  data
```

| Layer | Contains | May depend on |
|---|---|---|
| `domain/` | Types (`Credentials`, `Session`, `AuthUser`), `AuthError`, the ports `AuthProvider` and `SessionStorage`, validation | nothing (pure TypeScript, no `react`, no `react-native`) |
| `data/` | Adapters implementing the ports: `MockAuthProvider`, `InMemorySessionStorage` and, later, the HTTP provider and a secure storage | `domain` |
| `application/` | `AuthService` (use cases: restore, sign in, sign out), the session reducer, `AuthSessionProvider`, `useAuth` | `domain` (and `react`) |
| `presentation/` | Screens, flow components, their form hooks and the strings | `application`, `domain` types, `ui-components` |

- `AuthService` is plain TypeScript with no React, so it is testable without a renderer and usable by non-React code (a future HTTP client needs the access token).
- `data/` never imports from `application/` or `presentation/`.

## Rules

1. **Screens never talk to the backend.** They call `useAuth()` and render its state. No `fetch`, no provider calls and no storage access inside `presentation/`.
2. **The backend is a port.** Everything the flow needs from the server goes through `AuthProvider`. Switching to the real backend means writing one new adapter in `data/` and passing it to the `AuthService` the host builds; no other file changes.
3. **Dependencies are injected, not imported.** The host builds `new AuthService(provider, storage)` once, outside any component, and passes it to `AuthSessionProvider` (`service` prop). Nothing in `application/` or `presentation/` imports a concrete adapter. The host chooses the adapters at its entry point and can reuse the same service from non-React code.
4. **The mock is a first-class adapter**, not a test hack. It lives in `data/`, is exported publicly, simulates latency and every failure the real backend can return, and is configurable (users, latency, forced error) so tests can drive each state.
5. **Typed, platform-agnostic errors.** The domain throws `AuthError` with a stable `code` (`invalid-credentials`, `network`, `unknown`, ...). The UI maps the code to a message; it never shows raw backend text and never inspects error strings.
6. **Session state is a pure reducer** with explicit statuses (`restoring`, `signedOut`, `signedIn`). No boolean soup, no shared mutable state.
7. **Tokens never touch plain storage.** `SessionStorage` is a port. The default `InMemorySessionStorage` is for mock/tests only; production uses an adapter backed by Keychain (iOS) / Keystore (Android), provided by the host. Never log tokens, passwords or emails.
8. **No secrets in code.** The mock's fake users and tokens are obviously fake values. Real endpoints and keys come from the host configuration; follow `.claude/rules/security.md`.
9. **Validation lives in `domain/`** as pure functions returning field errors; the screen only displays them.
10. **UI uses tokens and `P*` components only.** No hardcoded colors, spacing or font sizes; no re-implementing an input or button that `ui-components` already offers. If a needed component is missing, add it to `ui-components` instead of working around it.
11. **Navigation stays with the host; the module only orchestrates closed flows.** Screens expose callbacks (`onSignUpPress`, `onForgotPasswordPress`); the host decides where they go. The module may ship a flow component (`SignUpFlow`, `PasswordRecoveryFlow`) that chains a few screens with plain React state, but only when its steps share data the host should not see and the flow has a single exit. A flow exposes exit callbacks (`onFinished`, `onSignInPress`), never a navigation object, and never navigates to another module or into the app: leaving the flow is the host's call, and a successful sign-in is observed through `useAuth().status`. When a flow needs hardware or gesture back, transitions, a header, deep links into a step, or more than about four steps with branches, stop and ask: that is the point to approve a navigation library.
12. **Minimal, stable public API.** Everything public is exported from `src/index.ts`. Consumers do not deep-import.
13. **User-facing text lives in one `strings` file** per screen group, keyed in English. Screens do not inline literals.
14. **Every public screen and flow has a showcase** in the module's `example/` running against the mock, and the logic in `domain/`, `data/` and `application/` has unit tests (Jest).

## Structure

```
src/
  index.ts
  domain/         types.ts, errors.ts, AuthProvider.ts, SessionStorage.ts, validation.ts
  data/           MockAuthProvider.ts, InMemorySessionStorage.ts
  application/    AuthService.ts, authSessionReducer.ts, AuthSessionProvider.tsx, useAuth.ts
  presentation/   <Screen>.tsx, <Name>Flow.tsx, use<Screen>Form.ts, strings.ts
example/          showcase app (Expo) wired to the mock
```

- Start flat inside each layer; add a subfolder per screen only when a screen grows its own components.
- Do not add a navigation library, a state library or a form library to the module without explicit approval.

## Build output

- `lib/` is generated by `npm run build` (`tsc` + `react-native-builder-bob`) and is git-ignored. Never edit it by hand.
