---
name: create-design-system-module
description: Scaffold a new React Native module that follows the design-system-library architecture (tokens + presentational components, one public entry point, showcase app, built with react-native-builder-bob). Use when asked to create a new UI/component library module under modules/ui/.
---

# Create a design system library module

Scaffolds a new module under `modules/ui/` (the `ui` family) as a **design system library**: design tokens, presentational components, a single public API, and a showcase app that documents it. It is a library, not an application: no domain logic, navigation, networking or app state.

The architecture is defined in `.claude/rules/design-system-library-architecture.md`. Read it first and follow it.

**This skill is self-contained.** Everything needed to create a module is described here, including the configuration files. Do not depend on any existing module being present or correct.

## Reference modules (optional, orientative)

Existing `modules/ui/*` modules (e.g. `modules/ui/ui-components`) can be consulted as examples of a working module. Rules for using them:

- **This skill and the rules win** over any existing module whenever they differ.
- Copy the *structure and configuration*; do **not** copy their imperfections: `lib/` committed to git, `any` in props or events, hardcoded values instead of tokens, `console.log` left in showcase screens, user-facing text in a language other than English, and `react` / `react-native` versions that differ from the rest of the workspaces.
- If no reference module exists, or it no longer matches this skill, ignore it and rely only on this document.

## Parameters (ask the user if not given)

| Parameter | Example | Notes |
|---|---|---|
| Module name | `ui-components` | kebab-case, **must start with `ui-`** (`ui-<topic>`); becomes the folder and the npm package name. The prefix is what makes the architecture rule apply automatically |
| Component prefix | `P` | Short, unique, applied to every component (`PButton`). Must not collide with other modules' prefixes |
| Initial components | `Button`, `Card` | Optional; start small |
| Token set | reuse or new | Decide whether it consumes the tokens of an existing module or defines its own |

Substitute `<module-name>` and `<Prefix>` everywhere below. Never hardcode names from another module.

## Steps

1. **Check for overlap.** List `modules/ui/`. If an existing module already covers the need, or the tokens should be shared, say so and confirm with the user before creating another one.
2. **Create the structure** at `modules/ui/<module-name>/`:
   ```
   package.json
   tsconfig.json
   .gitignore
   src/
     index.ts            # public API: re-exports theme and components
     theme/              # tokens only, depend on nothing
       index.ts
     components/         # depend on theme, never the reverse
       index.ts
   example/              # showcase app (Expo)
   ```
3. **`package.json`** (replace `<react-version>` / `<rn-version>` with the versions used by the host app that will consume the module; if versions already differ across workspaces, tell the user):
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
       "build": "tsc --emitDeclarationOnly && bob build",
       "prepare": "npm run build"
     },
     "type": "commonjs",
     "peerDependencies": { "react": "*", "react-native": "*" },
     "devDependencies": {
       "@types/react": "^18.0.0",
       "react": "<react-version>",
       "react-native": "<rn-version>",
       "react-native-builder-bob": "^0.43.0",
       "typescript": "^5.0.0"
     },
     "exports": {
       ".": {
         "import": { "types": "./lib/typescript/index.d.ts", "default": "./lib/module/index.js" },
         "require": { "types": "./lib/typescript/index.d.ts", "default": "./lib/commonjs/index.js" }
       },
       "./package.json": "./package.json"
     },
     "files": ["src", "lib", "!**/__tests__", "!**/__fixtures__", "!**/__mocks__"],
     "react-native-builder-bob": {
       "source": "src",
       "output": "lib",
       "targets": [["module", { "esm": true }], "commonjs"]
     }
   }
   ```
   - `react` and `react-native` stay as `peerDependencies`; add no other runtime dependency without explicit approval.
   - The `devDependencies` install their own `node_modules/react-native` inside the module. When the showcase bundles the module's `src`, that copy can end up in the bundle next to the example's own `react-native` (see step 8 for the required Metro fix).
4. **`tsconfig.json`**:
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
       "skipLibCheck": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "lib", "example"]
   }
   ```
5. **Theme tokens** in `src/theme/`: colors, spacing, typography, borders, shadows (+ text presets if needed), exported from `theme/index.ts`. Components must use these; no hardcoded values. For animation modules add a `motion` token group with durations, easings, distances, scales and default sizes, so components contain no literal numbers or `Easing.*` calls.
6. **Components** in `src/components/<Prefix><Name>.tsx`, exported from `components/index.ts`. Each one: named export plus exported `<Prefix><Name>Props`, strict types, no `any`, tokens only, presentational only.
7. **Public API**: `src/index.ts` exports `./components` and `./theme`. Consumers never deep-import.
8. **Showcase app** in `example/` (Expo + React Navigation):
   - `index.ts`: `registerRootComponent(App)` from `expo`. `App.tsx`: `SafeAreaProvider` > `NavigationContainer` > navigator. `tsconfig.json`: `{ "extends": "expo/tsconfig.base", "compilerOptions": { "strict": true } }`. `app.json`: Expo config with `name` and `slug` set to `<module-name>-example`, plus the default icon assets.
   - `package.json` (`"private": true`, name `<module-name>-example`, `"main": "index.ts"`, scripts `start`/`android`/`ios`) with dependencies `expo`, `expo-asset`, `expo-constants`, `expo-status-bar`, `react`, `react-native`, `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/native-stack`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, and dev dependencies `typescript` and `@types/react`. Pick versions compatible with one Expo SDK (use `npx expo install <packages>` so they match). Run `npm install` inside `example/`.
   - `metro.config.js`: watch the workspace root, resolve its `node_modules`, **and force a single copy of `react` and `react-native`**. Without this the app crashes at runtime with `TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found` (the bundle compiles fine, it is not a syntax error). Do **not** use `resolver.disableHierarchicalLookup = true`: it breaks nested dependencies such as `@react-native/virtualized-lists`. `workspaceRoot` is the **repository root**: from `modules/ui/<module-name>/example` that is four levels up (`../../../..`); double-check the count.
     ```js
     const { getDefaultConfig } = require('expo/metro-config');
     const path = require('path');

     const projectRoot = __dirname;
     const workspaceRoot = path.resolve(projectRoot, '../../../..');
     const SINGLETON_PACKAGES = ['react', 'react-native'];

     const config = getDefaultConfig(projectRoot);

     config.watchFolders = [workspaceRoot];
     config.resolver.nodeModulesPaths = [
       path.resolve(projectRoot, 'node_modules'),
       path.resolve(workspaceRoot, 'node_modules'),
     ];

     // Resolve react / react-native as if imported from the example, so the
     // module's own devDependency copies never reach the bundle.
     const defaultResolveRequest = config.resolver.resolveRequest;
     config.resolver.resolveRequest = (context, moduleName, platform) => {
       const isSingleton = SINGLETON_PACKAGES.some(
         (name) => moduleName === name || moduleName.startsWith(`${name}/`)
       );
       const resolveRequest = defaultResolveRequest ?? context.resolveRequest;
       if (!isSingleton) return resolveRequest(context, moduleName, platform);
       return resolveRequest(
         { ...context, originModulePath: path.join(projectRoot, 'index.ts') },
         moduleName,
         platform
       );
     };

     module.exports = config;
     ```
   - A catalog list (`catalogConfig.ts`), a navigator, and one screen per component showing variants and states. Screens import from the module's `src` entry. All showcase text in English; no `console.log`.
9. **Version control hygiene.** The module `.gitignore` ignores `node_modules/`, build output (`lib/`) and local/secret files (`.env*`, `*.jks`, `*.p12`, `*.key`, `*.mobileprovision`). Follow `.claude/rules/security.md`.
10. **Rule scope.** Nothing to edit: the architecture rule applies to every `modules/ui/**` path, so a module created there is covered automatically. Modules that are not design system libraries belong in another family folder (`auth`, `feature`) and must not be named `ui-*`.
11. **Wire the consumer** (only if the user asks): add `"<module-name>": "^<module version>"` (a semver range; npm links the workspace, and it keeps working when the module moves to its own repository) to the host app's `package.json` and import from the package name. Remind the user that `lib/` must be built (`npm run build` in the module) before Metro in the host can resolve it.
12. **Verify.**
    - `npm install` at the repo root (workspaces pick up `modules/*/*`).
    - `npx tsc --noEmit` and `npm run build` in the module; both must pass.
    - `npx tsc --noEmit` in `example/` as well, and `npx prettier --check` on `src` and `example` (the repo `.prettierrc` applies).
    - Run the showcase step by step, checking each one before the next:
      1. Free ports 8081/8082/19000/19001 (a stale Metro with an old config keeps serving it and makes `expo start` skip the dev server).
      2. Start Metro alone, without the emulator: `CI=1 npx expo start --offline --clear` inside `example/`.
      3. Request the bundle: `curl "http://localhost:8081/index.bundle?platform=android&dev=true"` must return HTTP 200. This gives clear resolution errors in seconds.
      4. Check the bundle has a single `react-native` and no references to `<module>/node_modules`.
      5. Open the app in the emulator (`adb shell am start -a android.intent.action.VIEW -d exp://10.0.2.2:8081 host.exp.exponent`), open every component screen and read `adb logcat -s ReactNativeJS:E AndroidRuntime:E`.
    - If it cannot be run, say so explicitly instead of claiming it works.
13. **Commit** only if the user asks: scan the diff first (`.claude/rules/security.md`), English past-tense message (`Added <module-name> module`), and never push without authorization (`.claude/rules/git.md`).

## Checklist

- [ ] Module is a library: no domain logic, navigation, networking or app state
- [ ] Dependencies flow `theme → components` only
- [ ] `react` / `react-native` are peer dependencies; nothing else added at runtime
- [ ] Single public entry (`src/index.ts`); typed props, no `any`
- [ ] Tokens only, no hardcoded values (including durations and easings)
- [ ] Example `metro.config.js` forces a single `react` / `react-native` and `workspaceRoot` is the repo root
- [ ] Showcase ran on a device/emulator with no errors in the log
- [ ] Every component has a showcase screen
- [ ] Module name starts with `ui-` and the component prefix is unique across modules
- [ ] Nothing copied from a reference module that violates the rules (no `lib/` in git, no `any`, no `console.log`)
- [ ] Type-check and build pass; `lib/` and secrets not committed by accident
