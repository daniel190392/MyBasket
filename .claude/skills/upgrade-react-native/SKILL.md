---
name: upgrade-react-native
description: Upgrade React Native (and the React / tooling versions that must move with it) across the MyBasket monorepo and verify the Android host still works. Use when asked to bump react-native in apps/host-android and modules/ui-*, or to re-verify the host after any dependency or Gradle change.
---

# Upgrade React Native

Moves the whole monorepo to a target React Native version in one coordinated change, then verifies it with a single script that reports PASS or FAIL. Only investigate details when the script fails.

## Why everything moves together

React Native has a JS half (npm `react-native`) and a native half (Gradle `react-android`, `hermes-android`). They talk to each other at runtime, so both halves must be the same version. In this monorepo the npm copy is hoisted to the root `node_modules` and shared by the host and the modules, so a module asking for a different version would get a nested second copy (duplicate React / RN breaks hooks and native modules).

## Parameters (ask the user if not given)

| Parameter | Example | Notes |
|---|---|---|
| Target version | `0.81.5` | Use the latest patch of the next minor unless told otherwise. Upgrade one minor at a time |

## Procedure

### 1. Research the target version

Run these and read only what changes:

```
npm view react-native@<v> peerDependencies --json     # required React / @types/react
npm view react-native@<v> dependencies --json         # metro, community-cli-plugin
npm view react-native@<v> engines --json              # Node requirement
npm view @react-native/metro-config@<v> version
npm view @react-native/babel-preset@<v> version
```

The Gradle version the RN plugin targets can be read from `https://unpkg.com/@react-native/gradle-plugin@<v>/gradle/wrapper/gradle-wrapper.properties`. Compare it with the host's Gradle (`apps/host-android/gradle/wrapper/gradle-wrapper.properties`); see the pitfalls below.

If the new version needs a different React minor, that changes `react` and `@types/react` everywhere too.

### 2. Bump in lockstep

| File | What to change |
|---|---|
| `package.json` (root) | `react-native`, `react`, `@react-native/metro-config`, `@types/react` |
| `apps/host-android/package.json` | `react`, `react-native`, `@react-native/babel-preset`, `@react-native/metro-config` |
| `modules/*/package.json` | `devDependencies`: `react`, `react-native`, `@types/react`. `peerDependencies`: raise the minimums to the version just tested (`react-native` `>=<minor>.0`, `react` `>=<react version>`) |
| `apps/host-android/app/build.gradle.kts` | `com.facebook.react:react-android` and `hermes-android` versions |

Pin exact versions (no `^`) for `react`, `react-native` and the `@react-native/*` packages. Keep `@react-native-community/cli` pinned (never `latest`); only bump it if the bundle fails with `Invalid platform "android"`.

### 3. Install

`npm install` at the repo root. It runs each module's `prepare` (rebuilds `lib/`). Check there are no `ERESOLVE`, invalid or extraneous peers, and a single copy of `react-native` and `react`.

### 4. Verify

Make sure an emulator is running (`emulator -avd Pixel_9`), then:

```
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/skills/upgrade-react-native/scripts/verify-host.ps1
```

It checks, in order: version consistency (host `package.json` = installed = Gradle, no nested copies), UI module builds, Metro bundle, Gradle `assembleDebug` + unit tests, and on the emulator: restarts Metro with a clean cache, installs the APK, opens the React Native view from the native screen and checks the expected component renders and survives a tap.

Output is one line per step and a final `RESULT:` line. Exit code `0` = PASS, `1` = FAIL, `2` = PARTIAL (no emulator, or `-SkipEmulator`).

- **PASS**: nothing else to investigate. Do not re-run steps manually.
- **FAIL**: the failing step prints the relevant lines and the path of the full log under `%TEMP%\rn-verify\`. Read only that log. Fix the cause, then re-run the script.
- **PARTIAL**: start an emulator and re-run before committing.

Useful parameters: `-ExpectedText` (text rendered by the React Native view, default `Example`; update it if `index.js` changes), `-NativeButtonText`, `-MainComponent`, `-RenderTimeoutSeconds`, `-SkipEmulator`.

`[INFO]` lines are warnings worth reporting to the user (for example the Legacy Architecture deprecation) but do not fail the run.

### 5. Commit

Follow `.claude/rules/security.md` and `.claude/rules/git.md`:

1. Review the diff for secrets and state that the check was done.
2. Stage only the version files (the four listed in step 2 plus `package-lock.json`), not unrelated working-tree changes.
3. Message in English, short, past tense: `Upgraded React Native to <v>`, with a one-paragraph body. No `Co-Authored-By` or generated-with lines.
4. Never push.

### 6. Report to the user

In Spanish, briefly: what changed, the PASS/FAIL result, anything new (warnings, requirements that changed) and whether the next minor has known blockers.

## Known pitfalls

- **`npm install` can fail on a TypeScript error, not on npm.** Each module's `prepare` runs `tsc`, so new React Native types can break the install (RN 0.81 deprecated `TextInputFocusEventData`; `onFocus` / `onBlur` now use `FocusEvent` / `BlurEvent`). npm then rolls back and prints noisy `EPERM ... rmdir` warnings that are not the cause. Look for `error TS` in the output, fix the module source, or run `npm install --ignore-scripts` first to get clean dependencies and then `npm run build` in the module to see the real error.
- **Stale Metro.** `npm install` or `npm run build` in a module recreates `lib/`; a running Metro then reports `Unable to resolve module` for files that exist. The verify script restarts Metro with `--reset-cache`; do the same by hand when testing manually (`npx react-native start --reset-cache` from `apps/host-android`).
- **React Native Gradle plugin vs this toolchain.** The host uses Gradle 9.5 and AGP 9. The RN plugin (`com.facebook.react`) for 0.76-0.81 targets Gradle 8.x and fails on Gradle 9 (`JvmVendorSpec.IBM_SEMERU` removed). Do not apply it without changing the toolchain. 0.83+ plugins target Gradle 9.0 (not verified against 9.5).
- **New Architecture.** The host forces the Legacy Architecture (`isNewArchEnabled = false` in `MainApplication.kt`), which RN 0.80+ warns about. Enabling it from Kotlin alone fails with `'PlatformConstants' could not be found`: core Java TurboModules need the native `appmodules` library that the RN Gradle plugin builds. Legacy is expected to be removed around 0.82 (not verified); migrate before that.
- **`@react-native-community/cli`** must match the RN generation; `latest` once jumped to a major that dropped Android support for RN 0.76.
- **Hermes / Java.** `JAVA_HOME` falls back to Android Studio's `jbr` when unset; the script handles it.
- **PowerShell tool quirk.** Do not combine `Remove-Item` and `Start-Process` in one command; the permission filter may block the whole command.
