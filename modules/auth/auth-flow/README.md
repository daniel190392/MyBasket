# auth-flow

Authentication flow for React Native hosts: a login screen, the session state and the contract with the backend. The backend sits behind an interface, so a mock and the real service are interchangeable.

## Architecture

A small ports-and-adapters core behind a thin React layer.

```
presentation  ->  application  ->  domain  <-  data
```

| Layer          | Contains                                                                                                                     | Depends on                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `domain`       | Types, `AuthError`, the `AuthProvider` and `SessionStorage` ports, validation                                                | nothing (no React)             |
| `data`         | Adapters of the ports: `MockAuthProvider`, `InMemorySessionStorage`                                                          | `domain`                       |
| `application`  | `AuthService` (use cases), session reducer, `AuthSessionProvider`, `useAuth`                                                 | `domain`                       |
| `presentation` | `LoginScreen`, `RegisterScreen`, `ConfirmationScreen`, `RecoveryScreen`, `ResetPasswordScreen`, `PasswordRecoveryFlow`, their form hooks and strings | `application`, `ui-components` |

Rules that keep it swappable:

- Screens never call the backend. They read state and call actions through `useAuth()`.
- `application` and `presentation` never import a concrete adapter. The host chooses the adapters.
- Errors are typed (`AuthError` with a `code`); the UI maps codes to messages.

### Sign-in call chain

```
LoginScreen
└─ useLoginForm                       validates with domain/validation
   └─ useAuth()                       reads the context published by the provider
      └─ AuthSessionProvider.signIn
         ├─ AuthService.signIn
         │  ├─ AuthProvider.signIn    port; MockAuthProvider today
         │  └─ SessionStorage.save    port; InMemorySessionStorage today
         └─ dispatch(signedIn)        authSessionReducer computes the new state
```

On success nothing is returned to the screen: the session state changes and whoever reads `useAuth().status` reacts. On failure an `AuthError` is thrown up to the form hook.

### Session state

`restoring` (reading the stored session at startup) → `signedOut` or `signedIn`. The state lives in memory while the app runs; what survives a restart is whatever the `SessionStorage` adapter persists.

## Design decisions

**Why ports and adapters.** The module has to work against a mock today and a real backend later, and be embedded in hosts with different environments (backend URL, secure storage). Putting the backend and the storage behind interfaces makes both a one-line change at the host's entry point, and lets tests drive every state through the mock without patching anything.

**Why `AuthService` is a plain class, not part of the React layer.** Other modules (features, non-React code such as an HTTP client) will need the session's access token without living inside this module's component tree. Keeping the use cases outside React makes them reusable from there and testable without a renderer. Today the service exposes the use cases (`restoreSession`, `signIn`, `signUp`, `requestPasswordRecovery`, `signOut`); reading the current session from outside React is not exposed yet and will be added when the first consumer needs it.

**Why a reducer for the session.** The session has mutually exclusive statuses. A pure reducer keeps every transition in one place and unit-testable. It is an internal detail: consumers only see `useAuth()`.

**What it costs.** More files and indirection than a hook calling `fetch` directly, and two links that "Go to Definition" does not follow: `useAuth` to the provider (React context) and `AuthService` to the concrete adapter (an interface injected by the host).

**When something simpler is enough.** One host, one backend and no need for a mock: a hook with `fetch` and a small store covers a login with much less structure. This design pays off as the module is reused across hosts and environments and other modules start depending on the session.

## Usage

The host builds the service once, outside any component, and mounts the provider:

```tsx
import {
  AuthService,
  AuthSessionProvider,
  InMemorySessionStorage,
  LoginScreen,
  MockAuthProvider,
  useAuth,
} from 'auth-flow';

const authService = new AuthService(
  new MockAuthProvider(),
  new InMemorySessionStorage()
);

function AuthGate() {
  const auth = useAuth();
  if (auth.status === 'restoring') return <Spinner />;
  if (auth.status === 'signedOut') {
    return (
      <LoginScreen
        onForgotPasswordPress={openRecovery}
        onSignUpPress={openSignUp}
      />
    );
  }
  return <Home user={auth.session.user} onSignOut={auth.signOut} />;
}

export default function App() {
  return (
    <AuthSessionProvider service={authService}>
      <AuthGate />
    </AuthSessionProvider>
  );
}
```

The module does not navigate: the screen exposes callbacks and the host decides what happens next.

## Switching to a real backend

Implement `AuthProvider` in `src/data/` (for example `HttpAuthProvider`), map HTTP and network failures to `AuthError` codes, and pass it to `AuthService` instead of the mock. Nothing else changes.

```ts
interface AuthProvider {
  signIn(credentials: Credentials): Promise<Session>;
  signUp(registration: Registration): Promise<SignUpResult>;
  signOut(session: Session): Promise<void>;
  confirmSignUp(confirmation: SignUpConfirmation): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  requestPasswordRecovery(email: string): Promise<void>;
  confirmPasswordRecovery(
    confirmation: PasswordRecoveryConfirmation
  ): Promise<void>;
}
```

## Session persistence

`InMemorySessionStorage` is for the mock and tests only: the session is lost when the app closes. A production host must supply a `SessionStorage` adapter backed by the platform secure storage (Keychain on iOS, Keystore on Android).

## Mock backend

`MockAuthProvider` is a public adapter meant for development and tests. Options:

| Option      | Default                              | Purpose                                           |
| ----------- | ------------------------------------ | ------------------------------------------------- |
| `users`     | `DEFAULT_MOCK_USERS` (one demo user) | Accounts that can sign in                         |
| `latencyMs` | `DEFAULT_MOCK_LATENCY_MS`            | Simulated network delay                           |
| `failWith`  | none                                 | Forces every call to fail with an `AuthErrorCode` |

## Development

```
npm test          # unit tests (Jest)
npm run typecheck # tsc --noEmit
npm run build     # lib/ via react-native-builder-bob
```

`example/` is an Expo showcase running against the mock (`npm install && npm start` inside it). `ui-components` must be built first (`npm run build` in `modules/ui/ui-components`).

## Public API

Everything is exported from the package entry point: the domain types, `AuthError` and `isAuthError`, `validateCredentials`, `validateRegistration`, `validateConfirmationCode`, `validateRecovery`, `validateResetPassword`, the `AuthProvider` and `SessionStorage` types, `MockAuthProvider`, `InMemorySessionStorage`, `AuthService`, `AuthSessionProvider`, `useAuth`, `LoginScreen`, `RegisterScreen`, `ConfirmationScreen`, `RecoveryScreen`, `ResetPasswordScreen`, `PasswordRecoveryFlow`.
