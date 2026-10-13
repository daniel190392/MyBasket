# secure-storage

Encrypted key-value storage for React Native. Values are encrypted with a key that never leaves the platform secure store. Today only Android is implemented (Android Keystore); iOS (Keychain) arrives with `host-ios`.

It is a **native module** (TurboModule): TypeScript on the React Native side, Kotlin on the Android side. It has no UI and no example app, so it is verified through a host (see [Testing](#testing)).

## What it is for, and what it is not

- It stores small secrets as text: today the auth session. Keys are namespaced by the module that uses them (`auth.session`) because every module shares the same store.
- It is generic: it does not know what a session is and does not depend on `auth-flow`. The auth-specific part (turning a `Session` into text) lives in `auth-flow`, in `SecureSessionStorage`.
- It is not for non-sensitive data and not for large values.

## Usage

```ts
import { secureStorage } from 'secure-storage';

await secureStorage.setItem('auth.session', json);
const value = await secureStorage.getItem('auth.session'); // string | null
await secureStorage.removeItem('auth.session');
```

`getItem` resolves `null` when the key does not exist. Failures reject with a stable code: `decrypt-failed`, `encrypt-failed` or `write-failed`. The caller decides what an unreadable value means; `AuthService` treats it as "no session", clears it and the user signs in again.

The host wires it to auth without either package importing the other: `auth-flow` declares a `KeyValueStore` port with the same three methods and `secureStorage` fits it structurally.

```ts
new AuthService(provider, new SecureSessionStorage(secureStorage));
```

## How it is built

```
src/
  NativeSecureStorage.ts   The contract (Spec) and the lookup of the native module
  SecureStorage.ts         The public interface consumers see
  index.ts                 Exports `secureStorage` and the `SecureStorage` type
android/
  build.gradle             Library plugins; codegen runs through the React Native plugin
  src/main/java/com/mybasket/securestorage/
    SecureStorageModule.kt   Implements the contract; persists in SharedPreferences
    KeystoreCipher.kt        AES-GCM encryption with a Keystore key
    SecureStoragePackage.kt  Registers the module with React Native
```

**The contract.** `Spec` in `NativeSecureStorage.ts` is read by codegen when the host builds. Codegen generates the Java base class `NativeSecureStorageSpec`, and `SecureStorageModule` extends it, so a mismatch between TypeScript and Kotlin does not compile. `getEnforcing('SecureStorage')` fails fast if the native module is missing. `SecureStorage` repeats the same signatures on purpose: `Spec` is an implementation detail, `SecureStorage` is what consumers depend on.

**The cipher.** The Android Keystore stores keys, not data, so the module encrypts and keeps the result itself. `KeystoreCipher` creates one AES-256 key under a fixed alias inside the Keystore and encrypts with AES-GCM. The output is `base64(iv + ciphertext)`: the Keystore picks a new random 12-byte IV on every encryption and decryption needs the same one, so it travels with the data. `decrypt` throws `GeneralSecurityException` for any value it cannot decrypt, including one that is not well formed.

**The persistence.** `SecureStorageModule` keeps each encrypted value in a private SharedPreferences file (`com.mybasket.securestorage`). Writes use `commit()` so a failed write rejects instead of being lost silently. Promise methods run on a native background thread, not the main thread.

**The registration.** `SecureStoragePackage` creates the module the first time JS asks for it. The host does not mention it: autolinking adds it to the generated `PackageList` because the host depends on this package.

A save, end to end:

```
secureStorage.setItem(key, text)            JS
  -> generated contract                     bridge (JSI)
  -> SecureStorageModule.setItem            Kotlin
  -> KeystoreCipher.encrypt                 key stays in the Keystore
  -> SharedPreferences (private file)       stores only the encrypted text
```

## Linking it to a host

Add `"secure-storage": "^1.0.0"` to the host `package.json` and run `npm install` at the repo root (it builds `lib/`). No Gradle change is needed in `apps/host-android`: its `autolinkLibrariesFromCommand` finds the `android/` folder. The library `build.gradle` has no `buildscript` block on purpose, because the host already puts the Android and Kotlin plugins on the classpath and a second version would conflict.

## Testing

There is no example app, because the module needs the native runtime. The adapter that uses it is covered by unit tests in `auth-flow` (`SecureSessionStorage.test.ts`, with a fake `KeyValueStore`). The native code is checked in the host app:

1. Build and install the host (`./gradlew :app:assembleDebug`, JDK 17), start Metro with `--reset-cache`, sign in, close the app completely and reopen it: it should enter without the login.
2. To check recovery from a bad value, overwrite the stored value on a debuggable build and reopen the auth screen. It must show the login and the stored value must be gone:

```
adb exec-in run-as com.example.androidhostapp sh -c "cat > shared_prefs/com.mybasket.securestorage.xml" < file.xml
```

where `file.xml` is a SharedPreferences file with `<string name="auth.session">VALUE</string>` and `VALUE` is not valid Base64, is too short, or is valid Base64 that was never encrypted with the key.

After changing any TypeScript here, run `npm run build` in this module and restart Metro with `--reset-cache`, because the host consumes `lib/`.

## Changing it

- **Add a method:** declare it in `Spec` and in `SecureStorage`, then implement it in `SecureStorageModule`. The host build fails until the abstract method is implemented, which is the point.
- **Add iOS:** add an `ios/` folder and a podspec, and implement the same three methods against the Keychain with the same semantics (`null` for a missing key, rejection with the same codes). The TypeScript side does not change.
- **Change the stored format or the key alias:** old values become undecryptable. That is handled as "no session", but it signs users out, so do it deliberately.

## Known limits

- The host allows Android backups and uses the default backup rules, which exclude nothing. SharedPreferences can therefore be restored on a new device while the Keystore key cannot, leaving a value nobody can decrypt. Recovery already handles it (the user signs in again). Excluding `com.mybasket.securestorage.xml` in the host backup rules would avoid it; that is a host decision.
- The key does not require user authentication (no biometrics or screen unlock), so the app can use it at any time.
- Every module shares one store and one key; isolation between modules is by key prefix only.
