# auth-flow

Authentication flow for React Native hosts: a login screen, the session state and the contract with the backend. The backend sits behind an interface, so a mock and the real service are interchangeable.

## Architecture

A small ports-and-adapters core behind a thin React layer.

```
presentation  ->  application  ->  domain  <-  data
```

| Layer          | Contains                                                                                                                                                           | Depends on                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `domain`       | Types, `AuthError`, the `AuthProvider` and `SessionStorage` ports, validation                                                                                      | nothing (no React)             |
| `data`         | Adapters of the ports: `RemoteAuthProvider`                                                                                                                        | `domain`                       |
| `application`  | `AuthService` (use cases), session reducer, `AuthSessionProvider`, `useAuth`                                                                                       | `domain`                       |
| `presentation` | `LoginScreen`, `RegisterScreen`, `ConfirmationScreen`, `RecoveryScreen`, `ResetPasswordScreen`, `SignUpFlow`, `PasswordRecoveryFlow`, their form hooks and strings | `application`, `ui-components` |

Rules that keep it swappable:

- Screens never call the backend. They read state and call actions through `useAuth()`.
- `application` and `presentation` never import a concrete adapter. The host chooses the adapters.
- The shared mock (`MockAuthProvider`, `InMemorySessionStorage`) lives in `src/testing/`: it serves the example and the tests, is not exported and is not part of the build.
- Errors are typed (`AuthError` with a `code`); the UI maps codes to messages.

### Sign-in call chain

```
LoginScreen
└─ useLoginForm                       validates with domain/validation
   └─ useAuth()                       reads the context published by the provider
      └─ AuthSessionProvider.signIn
         ├─ AuthService.signIn
         │  ├─ AuthProvider.signIn    port; RemoteAuthProvider (the mock in tests and the example)
         │  └─ SessionStorage.save    port; supplied by the host (in memory in the example)
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
  LoginScreen,
  RemoteAuthProvider,
  useAuth,
} from 'auth-flow';

// clientId and endpoint come from the host configuration, never from code.
// secureSessionStorage is a SessionStorage backed by Keychain / Keystore.
const authService = new AuthService(
  new RemoteAuthProvider({ clientId, endpoint }),
  secureSessionStorage
);

function AuthGate() {
  const auth = useAuth();
  if (auth.status === 'restoring') return <Spinner />;
  if (auth.status === 'signedOut') {
    return (
      <LoginScreen
        onForgotPasswordPress={openRecovery}
        onSignUpPress={openSignUp}
        onConfirmationRequired={openConfirmation}
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

`RemoteAuthProvider` is the adapter for the real backend (Amazon Cognito over HTTPS). To support another backend, implement `AuthProvider` in `src/data/`, map HTTP and network failures to `AuthError` codes, and pass it to `AuthService`. Nothing else changes.

```ts
interface AuthProvider {
  signIn(credentials: Credentials): Promise<Session>;
  refreshSession(session: Session): Promise<Session>;
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

Signing in to an account that was never confirmed rejects with `user-not-confirmed`. `LoginScreen` hands the email to the host through `onConfirmationRequired`, and the host can open `SignUpFlow` at its confirmation step with `initialEmailToConfirm`. Signing up again with that email is rejected with `email-already-in-use`: the module never resends a code on sign up, because it would let anyone who knows an email set the password of an account its owner confirms.

`requestPasswordRecovery` resolves the same way for a known email, an unknown one and an account that was never confirmed (the backend rejects the last one, and the adapter hides it), so the response does not reveal which emails exist or have a pending sign up.

## Session persistence

The example and the tests use an in-memory storage (in `src/testing/`, not exported): the session is lost when the app closes. A production host persists the session with `SecureSessionStorage`, which saves it as JSON in a `KeyValueStore` under the key `auth.session`. The host supplies a store backed by the platform secure storage (Keychain on iOS, Keystore on Android), for example the `secureStorage` of the `secure-storage` module:

```ts
new AuthService(provider, new SecureSessionStorage(secureStorage));
```

A stored value that cannot be read or is not a session makes `load` throw; `AuthService` treats that as no session, clears it and the user signs in again. That includes a session stored before the refresh token was kept: the user signs in once more.

## Session renewal

A `Session` holds the access token, the refresh token and `accessTokenExpiresAt`, the instant (milliseconds since the epoch) the access token stops being valid. The adapter computes it when it receives the token, so `Session` does not depend on how a backend reports lifetimes.

When the app starts, `AuthService.restoreSession` loads the stored session and, if its access token has expired or has less than a minute left (`RENEWAL_MARGIN_MS`), asks the provider to renew it with `refreshSession`, then stores the renewed session. The margin is there because a request that starts with seconds to spare can reach the server already expired, and it also absorbs small differences between the device clock and the server's. The split is deliberate: the provider knows how to renew, the service decides when to.

| The renewal...                                                                           | `restoreSession`                                                                                                                       |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| succeeds                                                                                 | returns and stores the renewed session                                                                                                 |
| is rejected (`session-expired`: the refresh token expired or the session was signed out) | clears the storage and returns `null`, so the user signs in again                                                                      |
| fails for any other reason (no connection, a backend error)                              | keeps and returns the stored session: that says nothing about the session, so the user is not signed out for something they did not do |

`RemoteAuthProvider` renews with Cognito's `REFRESH_TOKEN_AUTH` flow. Cognito does not issue a new refresh token on a renewal, so the session keeps the current one. Signing out revokes the refresh token in the backend but not an access token already issued, which stays valid until it expires.

The refresh token is as sensitive as a password for as long as it lives: it only goes to the `SessionStorage`, and it is never logged.

Renewal happens only on restore. An access token that expires while the app is open is not renewed yet; that needs a way to read a valid token from outside React and will be added with the first consumer of the access token. `AuthService` takes an optional clock (`now`, `Date.now` by default) so the expiry is testable.

## Mock backend

`MockAuthProvider` lives in `src/testing/` and is neither exported nor built: the example app and the tests import it by relative path. A contract suite (`src/testing/authProviderContract.ts`) runs against the mock and against `RemoteAuthProvider`, so both keep answering the same way. Options:

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

Everything is exported from the package entry point: the domain types, `AuthError` and `isAuthError`, `validateCredentials`, `validateRegistration`, `validateConfirmationCode`, `validateRecovery`, `validateResetPassword`, `isStrongPassword`, the `AuthProvider` and `SessionStorage` types, `RemoteAuthProvider`, `AuthService`, `AuthSessionProvider`, `useAuth`, `LoginScreen`, `RegisterScreen`, `ConfirmationScreen`, `RecoveryScreen`, `ResetPasswordScreen`, `SignUpFlow`, `PasswordRecoveryFlow`.
