---
name: create-auth-module
description: Scaffold a new React Native authentication module that follows the auth-module architecture (domain ports, swappable mock/real backend provider, session service, React provider + hook, screens built with ui-components, showcase app, Jest tests). Use when asked to create a module under modules/auth/ or to add an auth flow (login, sign up, recovery).
---

# Create an auth module

Scaffolds a module under `modules/auth/` (the `auth` family): the authentication **flow** (screens, session state) plus the **contract with the backend**, with a mock adapter so the real backend can be plugged in later by swapping one object.

The architecture is defined in `.claude/rules/auth-module-architecture.md`. Read it first and follow it. UI conventions come from `.claude/rules/react-native-typescript.md` and `.claude/rules/clean-code.md`.

**This skill is self-contained.** The core files are given verbatim below. Do not depend on an existing module being present or correct.

## Reference modules (optional, orientative)

Existing `modules/auth/*` modules can be consulted as examples. The skill and the rules win whenever they differ. Do not copy `lib/` into git, `any`, hardcoded values instead of `ui-components` tokens, `console.log`, or versions of `react` / `react-native` that differ from the rest of the workspaces.

## Parameters (ask the user if not given)

| Parameter | Example | Notes |
|---|---|---|
| Module name | `auth-flow` | kebab-case, **must start with `auth-`**; becomes the folder and the npm package name |
| Screens | `LoginScreen` | Start with the ones requested; one screen = one `presentation/<Screen>.tsx` + `use<Screen>Form.ts` |
| Design reference | image path | Optional image of the screen; match its layout using `ui-components` |
| UI library | `ui-components` | The design system package to consume. Check it has the components the screens need |

Substitute `<module-name>` everywhere below.

## Steps

1. **Check for overlap.** List `modules/auth/`. If a module already covers the need, say so and confirm before creating another one. Check the UI library exports what the screens need (`PInput`, `PButton`, `PLink`, tokens). If a component is missing, add it to the UI library first, do not work around it.
2. **Create the structure** at `modules/auth/<module-name>/`:
   ```
   package.json
   tsconfig.json
   tsconfig.build.json
   jest.config.js
   .gitignore
   src/
     index.ts
     domain/         types.ts, errors.ts, AuthProvider.ts, SessionStorage.ts, validation.ts
     data/           (real adapters, added when the backend exists)
     testing/        MockAuthProvider.ts, InMemorySessionStorage.ts, __tests__/ (not exported, not built)
     application/    AuthService.ts, authSessionReducer.ts, AuthSessionProvider.tsx, useAuth.ts
     presentation/   <Screen>.tsx, use<Screen>Form.ts, strings.ts
   example/          showcase app (Expo) wired to the mock
   ```
   Unit tests go next to the code in `__tests__/` folders (`src/domain/__tests__/validation.test.ts`, ...).
3. **`package.json`** (take `<react-version>` / `<rn-version>` from the host / workspace; take `<ui-version>` from the UI library's `package.json`):
   ```json
   {
     "name": "<module-name>",
     "version": "1.0.0",
     "description": "<short description>",
     "main": "./lib/commonjs/index.js",
     "module": "./lib/module/index.js",
     "react-native": "./lib/module/index.js",
     "types": "./lib/typescript/index.d.ts",
     "scripts": {
       "build": "tsc -p tsconfig.build.json --emitDeclarationOnly && bob build",
       "prepare": "npm run build",
       "typecheck": "tsc --noEmit",
       "test": "jest"
     },
     "type": "commonjs",
     "peerDependencies": {
       "react": "*",
       "react-native": "*",
       "ui-components": "^<ui-version>"
     },
     "devDependencies": {
       "@react-native/babel-preset": "<rn-version>",
       "@types/jest": "^29.5.0",
       "@types/react": "^19.1.4",
       "jest": "^29.7.0",
       "react": "<react-version>",
       "react-native": "<rn-version>",
       "react-native-builder-bob": "^0.43.0",
       "typescript": "^5.0.0",
       "ui-components": "^<ui-version>"
     },
     "exports": {
       ".": {
         "import": { "types": "./lib/typescript/index.d.ts", "default": "./lib/module/index.js" },
         "require": { "types": "./lib/typescript/index.d.ts", "default": "./lib/commonjs/index.js" }
       },
       "./package.json": "./package.json"
     },
     "files": ["src", "lib", "!**/__tests__", "!**/__fixtures__", "!**/__mocks__", "!src/testing"],
     "react-native-builder-bob": {
       "source": "src",
       "output": "lib",
       "exclude": "**/{__tests__,__fixtures__,__mocks__,testing}/**",
       "targets": [["module", { "esm": true }], "commonjs"]
     }
   }
   ```
   - The UI library is a **peer dependency** (the host must share one copy) plus a **dev dependency** so the workspace links it locally. Use a semver range, never `file:` or a relative path.
   - Nothing else at runtime. No navigation, state, form or HTTP library without explicit approval. Jest and its types are dev-only.
4. **`tsconfig.json`** (type-checks everything, including tests) and **`tsconfig.build.json`** (declarations only, tests excluded):
   ```json
   {
     "compilerOptions": {
       "rootDir": "./src",
       "outDir": "./lib/typescript",
       "target": "esnext",
       "module": "esnext",
       "lib": ["esnext"],
       "jsx": "react-native",
       "declaration": true,
       "strict": true,
       "moduleResolution": "bundler",
       "allowSyntheticDefaultImports": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "types": ["jest"]
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "lib", "example"]
   }
   ```
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": { "types": [] },
     "exclude": ["node_modules", "lib", "example", "src/**/__tests__", "src/testing"]
   }
   ```
   If images are imported (`require('./logo.png')`) and `tsc` does not know the module, add `src/assets.d.ts` with `declare module '*.png';`.
5. **`jest.config.js`**. Babel options are inline on purpose: a `babel.config.js` in the module would also be picked up by `bob build`.
   ```js
   module.exports = {
     testEnvironment: 'node',
     testMatch: ['**/__tests__/**/*.test.ts'],
     transform: {
       '^.+\\.[jt]sx?$': [
         'babel-jest',
         {
           babelrc: false,
           configFile: false,
           presets: ['module:@react-native/babel-preset'],
         },
       ],
     },
   };
   ```
   Tests cover `domain`, `data` and `application` logic that needs no React renderer (`AuthService`, reducer, validation, mock). Do not import `react-native` in them.
6. **Domain** (`src/domain/`, pure TypeScript):
   - `types.ts`: `Credentials { email, password }`, `AuthUser { id, email, displayName }`, `Session { user, accessToken }`. Add fields only when a requirement needs them.
   - `errors.ts`:
     ```ts
     export type AuthErrorCode = 'invalid-credentials' | 'network' | 'unknown';

     export class AuthError extends Error {
       readonly code: AuthErrorCode;

       constructor(code: AuthErrorCode, message: string = code) {
         super(message);
         this.name = 'AuthError';
         this.code = code;
       }
     }

     export const isAuthError = (error: unknown): error is AuthError =>
       error instanceof AuthError;
     ```
   - `AuthProvider.ts` (the backend port) and `SessionStorage.ts` (the persistence port):
     ```ts
     export interface AuthProvider {
       signIn(credentials: Credentials): Promise<Session>;
       signOut(session: Session): Promise<void>;
     }
     ```
     ```ts
     export interface SessionStorage {
       load(): Promise<Session | null>;
       save(session: Session): Promise<void>;
       clear(): Promise<void>;
     }
     ```
     Add a method to `AuthProvider` only for a use case that exists (sign up, password recovery...). Every addition also needs a mock implementation and tests.
   - `validation.ts`: pure `validateCredentials(credentials): CredentialsFieldErrors`, returning `Partial<Record<keyof Credentials, 'required' | 'invalid-email'>>`. The email pattern is a named constant. No messages here, only codes.
7. **Test double** (`src/testing/`): one shared mock for the example and the tests, depends on `domain` only. It is **not** exported from `src/index.ts` and is excluded from the build (see the `exclude` / `files` entries in steps 3 and 4); the example and the tests import it by relative path.
   - `MockAuthProvider.ts` implements `AuthProvider`. Options object: `users` (default: one clearly fake demo user, exported as `DEFAULT_MOCK_USERS`), `latencyMs` (named default constant), `failWith?: AuthErrorCode` to force every call to fail. `signIn` waits the latency, throws `AuthError('network')`-style errors when forced, throws `AuthError('invalid-credentials')` for an unknown email/password (compare the email case-insensitively and trimmed), and otherwise returns a `Session` with an obviously fake token (`mock-access-token-<id>`). `signOut` waits the latency.
   - `InMemorySessionStorage.ts` implements `SessionStorage` with a private field. It is for the mock and tests; document that production needs a Keychain / Keystore adapter supplied by the host.
   - A real backend later means a new file in `src/data/` (e.g. `RemoteAuthProvider.ts`) implementing `AuthProvider`, mapping HTTP/network failures to `AuthError` codes. Nothing else changes.
8. **Application** (`src/application/`):
   - `AuthService.ts`, plain TypeScript, no React:
     ```ts
     export class AuthService {
       constructor(
         private readonly provider: AuthProvider,
         private readonly storage: SessionStorage
       ) {}

       async restoreSession(): Promise<Session | null> {
         try {
           return await this.storage.load();
         } catch {
           // An unreadable stored session must not lock the user out.
           await this.storage.clear();
           return null;
         }
       }

       async signIn(credentials: Credentials): Promise<Session> {
         const session = await this.provider.signIn(credentials);
         await this.storage.save(session);
         return session;
       }

       async signOut(session: Session): Promise<void> {
         try {
           await this.provider.signOut(session);
         } finally {
           await this.storage.clear();
         }
       }
     }
     ```
   - `authSessionReducer.ts`: state `{ status: 'restoring' } | { status: 'signedOut' } | { status: 'signedIn'; session: Session }`, actions `restored` (session or null), `signedIn`, `signedOut`, exported `initialAuthSessionState`. Pure function.
   - `AuthSessionProvider.tsx`: props `{ service: AuthService; children }`. `useReducer` with the reducer; one `useEffect` that calls `service.restoreSession()` guarded by an `isActive` flag against unmounts; `signIn` (service call, then dispatch) and `signOut` (service call in `try`, dispatch `signedOut` in `finally`) wrapped in `useCallback`; context value memoized. It must not import any file from `data/`.
   - `useAuth.ts`: `useContext`, throws a descriptive `Error` when used outside the provider. The context value type is the state plus `signIn(credentials)` and `signOut()`.
9. **Presentation** (`src/presentation/`):
   - `strings.ts`: all user-facing text, keys in English. Include the message for each `AuthErrorCode` and each validation code. The default language of the texts follows the design reference.
   - `use<Screen>Form.ts`: owns the field values, validation errors, submit error code and `isSubmitting`. It validates with the domain function, calls `useAuth()` and maps a caught error with `isAuthError(error) ? error.code : 'unknown'`. It never calls a provider or storage.
   - `<Screen>.tsx`: composes `ui-components` only (`PInput`, `PButton`, `PLink`, tokens through `colors`, `spacing`, `textPresets`, `typography`, `controlHeight`). Match the design reference layout. Props: optional `logo` (`ImageSourcePropType`, with a bundled default under `src/presentation/assets/`) and the navigation callbacks (`onSignUpPress`, `onForgotPasswordPress`). Keyboard handling with `KeyboardAvoidingView` + `ScrollView` (`keyboardShouldPersistTaps="handled"`). Email input: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoComplete="email"`. Password input: `secureTextEntry`. Show the submit error in the free space above the button, using tokens. Give inputs and buttons `accessibilityLabel`s from `strings`. Layout constants (logo size) are named constants at the top of the file.
   - If a logo has to be extracted from the design reference image, crop it to a PNG with a transparent or matching background and keep it small.
10. **Public API**: `src/index.ts` exports the domain types, errors and ports, `AuthService`, `AuthSessionProvider`, `useAuth` and the screens. Nothing else: the mock and the in-memory storage stay out of the public API.
11. **Tests** (`__tests__/` next to the code; the mock's tests live in `src/testing/__tests__/`): validation, mock provider (success, wrong password, case-insensitive email, forced failure, latency via fake timers), `AuthService` (sign in persists, sign out clears even when the provider fails, restore returns the stored session, restore recovers from a failing storage), reducer (every transition).
12. **Version control hygiene.** The module `.gitignore` ignores `node_modules/`, `lib/` and local/secret files (`.env*`, `*.jks`, `*.p12`, `*.key`, `*.mobileprovision`). Follow `.claude/rules/security.md`.
13. **Showcase app** in `example/` (Expo), wired to the mock:
    - Same layout and `metro.config.js` as the design-system showcase (see `.claude/skills/create-design-system-module/SKILL.md`, step 8): watch the repo root, resolve its `node_modules`, force a single `react` / `react-native`. `workspaceRoot` is the repository root (four levels up from `modules/auth/<module-name>/example`). Install with `npx expo install` so versions match one Expo SDK, and add `"plugins": ["expo-asset"]` to `app.json` if the screen uses bundled images.
    - `App.tsx` builds the service **outside** the component (`new AuthService(new MockAuthProvider(), new InMemorySessionStorage())`, both imported from `../src/testing/...` because they are not exported), wraps the tree in `AuthSessionProvider` and renders by `useAuth().status`: a spinner while `restoring`, the login screen when `signedOut`, and a simple signed-in view (user name + sign-out button) when `signedIn`.
    - Show the mock demo credentials on screen and surface the navigation callbacks (for example a text line "Sign up pressed"). All showcase text in English; no `console.log`.
14. **Verify.**
    - `npm install` at the repo root so the workspace links the new package and `ui-components`.
    - Make sure the UI library's `lib/` is built (`npm run build` inside it); Metro and `tsc` resolve it from there.
    - In the module: `npm run typecheck`, `npm test` and `npm run build` must pass. In `example/`: `npx tsc --noEmit`. `npx prettier --check` on `src` and `example` (the repo `.prettierrc` applies).
    - Check the build output: `lib/` must contain the bundled assets (for example `lib/module/presentation/assets/*`). If `bob` did not copy them, fix it before continuing.
    - Run the showcase as in the design-system skill (free ports, start Metro alone with `CI=1 npx expo start --offline --clear`, request the Android bundle and expect HTTP 200, check there is a single `react-native` in it, then open it on the emulator and read `adb logcat -s ReactNativeJS:E AndroidRuntime:E`). Exercise: empty form (validation errors), wrong password (invalid credentials), correct credentials (signed-in view), sign out.
    - If it cannot be run, say so explicitly instead of claiming it works.
15. **Wire the host** only if the user asks: build the service at the host entry point, register the root component wrapped in `AuthSessionProvider`, add `"<module-name>": "^<version>"` to the host `package.json`.
16. **Commit** only if the user asks: scan the diff first (`.claude/rules/security.md`), English past-tense message (`Added <module-name> module`), and never push without authorization (`.claude/rules/git.md`).

## Checklist

- [ ] Layers respected: `presentation → application → domain ← data`; `domain` has no `react` / `react-native` imports
- [ ] Screens only use `useAuth()`; no backend, storage or navigation code inside them
- [ ] The backend is the `AuthProvider` port; the mock is a public adapter with latency and forced failures
- [ ] The host builds `AuthService` with its adapters; `application/` and `presentation/` import no concrete adapter
- [ ] Typed `AuthError` codes; the UI never shows raw error text
- [ ] No secrets, tokens or personal data in code or logs; mock values are obviously fake
- [ ] UI uses `ui-components` only, with tokens (no hardcoded colors, spacing, font sizes)
- [ ] `ui-components` is a peer dependency (semver range) and a dev dependency; nothing else at runtime
- [ ] User-facing text lives in `strings.ts`; code, identifiers and comments in English
- [ ] Type-check, tests and build pass; assets are present in `lib/`; `lib/` not committed
- [ ] Showcase ran on a device/emulator with no errors in the log
