# feature-home

Home feature for React Native: the product list with expiration dates, the favorites and the add-product screen. It is one embeddable unit for a native host: the host opens it, and the feature owns its internal navigation (tabs plus a pushed screen), so the host does not know the routes.

Architecture rule: `.claude/rules/feature-module-architecture.md`.

## Structure

```
src/
  index.ts          public API: HomeNavigator
  navigation/       HomeNavigator (container, stack, tabs) and typed param lists
  screens/          the three screens and their strings
```

## Navigation

```
HomeNavigator            NavigationIndependentTree > NavigationContainer
└─ Stack (native-stack)
   ├─ Tabs (bottom-tabs)
   │  ├─ Products
   │  └─ Favorites
   └─ AddProduct         pushed with a back header
```

The native dependencies of navigation (`react-native-screens`, `react-native-safe-area-context`) are peer dependencies: the host installs them and autolinking registers them.

## Usage

```tsx
import { HomeNavigator } from 'feature-home';

<HomeNavigator />;
```

The props the host passes in and the events the feature sends out appear when the feature has any (see the rule).

## Example

`example/` is an Expo showcase that renders `HomeNavigator` on its own, without the host app, so the module can be tried independently. It imports the module from `../src`. Its `metro.config.js` resolves `react-native-screens` and `react-native-safe-area-context` from the example, which Expo pins to the versions its runtime ships.

```
cd example
npm install
npm start
```

## Status

Skeleton: the structure and the navigator are in place and the three screens are placeholders that will be built from the designs.

## Build

`npm run build` inside the module.
