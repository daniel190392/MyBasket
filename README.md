# MyBasket

A household supplies basket: keep track of the products you have in stock and their expiration dates, so nothing goes bad.

MyBasket is a **personal engineering project** built to explore how a mobile product is architected when React Native and native code have to live together. The product is intentionally small; the value is in the architecture, the engineering practices and the way AI tooling is used to build it.

## At a glance

| Area               | What it demonstrates                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Architecture       | Monorepo of independent modules designed to be split into separate repositories, embedded in a native host app          |
| React Native       | React 19 + React Native 0.82 on the **New Architecture**, TypeScript, **TurboModule** with codegen                      |
| Native Android     | Kotlin host app, Gradle Kotlin DSL, React Native Gradle plugin, Android Keystore (AES-GCM) encryption                   |
| Design             | Ports and adapters in the auth module, a design system with its own showcase app, strict module boundaries              |
| Security           | Encrypted session storage, https-only backend, no cleartext in release, backup exclusions, password policy              |
| Quality            | Jest unit and contract tests, typed errors, strict TypeScript, Prettier, written clean-code rules                       |
| AI-assisted workflow | Claude Code with project rules, reusable skills and a read-only security-audit subagent, all versioned in the repo  |

## What the app does

- **Iteration 1** (in progress): product inventory with expiration date tracking, behind an authentication flow.
- **Iteration 2** (planned): a kitchen feature that suggests dishes to cook with the available products, prioritizing those closest to expiring.

Today the app implements the full authentication journey (sign in, sign up with email confirmation, password recovery and reset), session persistence and renewal, and the native host that wires everything together.

## Architecture

The repository is an npm-workspaces monorepo. React Native screens and components are built as **reusable modules** that a **native host app** embeds. This mirrors how large companies add React Native to an existing native app, rather than building a pure React Native app.

```
apps/
  host-android/          Native Android app (Kotlin + Gradle) that hosts React Native
  host-ios/              Native iOS app (planned)
modules/
  ui/
    ui-components/       Design system: tokens, theme and P-prefixed components
    ui-animation/        Animated components consuming the design tokens
  auth/
    auth-flow/           Login, sign up, recovery; session state; swappable backend
  platform/
    secure-storage/      TurboModule: encrypted key-value storage (Kotlin native code)
  feature/
    feature-home-flutter/  Flutter module for Home (planned)
```

Each folder under `modules/` is a **family** that is meant to become its own repository later, and so is each host. To keep that split cheap, packages depend on each other **by name and semver range** (never `file:` or relative paths across families), and nothing imports across families through relative paths.

### Highlights

**`auth-flow`: ports and adapters behind a thin React layer.**
Layers are `domain` (types, typed `AuthError`, the `AuthProvider` and `SessionStorage` ports, validation), `data` (`RemoteAuthProvider`), `application` (`AuthService`, session reducer, `useAuth`) and `presentation` (screens and flows). The backend and the storage sit behind interfaces, so the mock and the real service are interchangeable with a one-line change in the host. A shared **contract test suite** runs against both the mock and the remote provider so they cannot drift apart.

**`secure-storage`: a TurboModule with native code inside.**
A typed TypeScript contract feeds React Native codegen, which generates the native base class that the Kotlin module extends. Values are encrypted with an AES-GCM key that never leaves the Android Keystore. It is generic and does not depend on `auth-flow`: the host injects it into the auth module through a `KeyValueStore` port.

**`ui-components`: a design system as a library.**
Theme tokens (colors, spacing, typography, borders, shadows) and `P`-prefixed components (`PButton`, `PCard`, `PBadge`, `PInput`, `PLink`), built with `react-native-builder-bob` for ESM and CommonJS with generated types, and documented by an Expo showcase app.

**`host-android`: native host, single React Native root.**
One launcher activity hosts the React Native root, which decides what to show from the session status (restoring, signed out, signed in). Native code does not know about the session state, so the same boundary can later serve Flutter or push notifications.

## Tech stack

- **TypeScript**, **React 19**, **React Native 0.82** (New Architecture, Hermes)
- **Kotlin**, Gradle (Kotlin DSL), Android Gradle Plugin 8.12, JDK 17
- **Jest** for unit and contract tests, **Expo** for the component showcase apps
- **react-native-builder-bob** to build the libraries, **Metro** configured for the monorepo
- **Android Keystore** for encryption at rest
- Planned: Swift/iOS host, Flutter module

## Engineering practices

- **Security by default.** Release builds disable cleartext traffic; the remote provider requires an `https` endpoint; the encrypted session is excluded from Android backups; the React Native dev menu activity only exists in debug builds; an invalid auth endpoint is reported on screen instead of crashing; credential and signing files are git-ignored; Keystore failures map to typed errors; a password policy is enforced on sign up; unconfirmed accounts cannot be pre-hijacked by resending sign up. Secrets never live in the repository, and every commit is checked for them first.
- **Session handling.** The session is restored at startup and renewed when the access token is about to expire, with a safety margin.
- **Documented decisions.** Module READMEs record *why* a design was chosen, what it costs and when something simpler would be enough.
- **Clean code as a written rule.** Intent-revealing names, small single-purpose units, no dead code, no magic values, explicit error handling.
- **Small, reviewable changes.** Feature branches, pull requests, short past-tense commit messages.

## Working with AI

AI is treated as a team member that has to follow the project's engineering standards, not as an autocomplete. The setup is versioned in `.claude/`, so anyone cloning the repository gets the same behavior.

- **Project instructions** (`CLAUDE.md`): the product, the structure, the stack and the conventions the assistant must respect.
- **Architecture and quality rules** (`.claude/rules/`): clean code, auth-module architecture, design-system architecture, Kotlin/Android, React Native/TypeScript, Swift/iOS, security and git. Rules are scoped to the paths they apply to, so each one only loads when relevant.
- **Reusable skills** (`.claude/skills/`): repeatable workflows packaged as instructions.
  - `create-auth-module` scaffolds a new auth module that follows the architecture.
  - `create-design-system-module` scaffolds a new UI library.
  - `upgrade-react-native` bumps React Native across the monorepo and verifies the Android host with a script.
- **Specialized subagent** (`.claude/agents/security-reviewer`): an independent, read-only security auditor that checks the whole repository against the project's security rules and OWASP MASVS and reports unmet controls with `path:line` evidence. It never edits files; its findings drive the hardening commits.
- **Guardrails.** The assistant must ask for explicit authorization before every `git push`, scan every commit for secrets, and cannot write credentials into code or configuration.

The result is that the assistant accelerates the work while architecture, security and review decisions remain deliberate and verifiable. Using it well for a multi-module, multi-language codebase is part of what this project is meant to practice.

## Getting started

Requirements: Node.js, JDK 17, Android Studio with an emulator or a device.

```bash
npm install                      # installs every workspace

# Build a library (example: the design system)
npm run build --workspace modules/ui/ui-components

# Run the auth module tests
npm test --workspace modules/auth/auth-flow

# Run the Android host
cd apps/host-android
npm start                        # starts Metro
# then run the app from Android Studio, or ./gradlew installDebug
```

Copy `apps/host-android/local.properties.example` to `local.properties` and adjust it for your machine; that file is git-ignored. Each module has its own `example/` showcase app (Expo) that can be run independently.

## Roadmap

- Inventory module: products and expiration dates.
- Shared API client that attaches the token and retries on 401, wired to `auth-flow` by the host.
- iOS host with Keychain-backed secure storage.
- Flutter module for Home, to test cross-framework integration.
- Kitchen feature that suggests dishes from the products closest to expiring.
