# feature-home

Home feature for React Native: the product list with expiration dates, the favorites and the add-product screen. It is one embeddable unit for a native host: the host opens it, and the feature owns its internal navigation (tabs plus a pushed screen), so the host does not know the routes.

Architecture rule: `.claude/rules/feature-module-architecture.md`.

## Structure

```
src/
  index.ts          public API: HomeNavigator and the ProductRepository port
  navigation/       HomeNavigator (container, stack, tabs) and typed param lists
  screens/          the three screens, their strings and the label helpers
  components/       ProductRow, shared by the list screens
  state/            ProductsProvider and useProducts (products shared by the tabs)
  domain/           Product, expiration status, filtering, grouping and the port
  testing/          in-memory repository (not exported, not built)
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

<HomeNavigator productRepository={productRepository} />;
```

`productRepository` implements the `ProductRepository` port (`list`, `setFavorite`). The host provides the adapter; switching the data source never touches a screen. The events the feature sends out appear when the feature has any (see the rule).

## Domain

Pure functions in `src/domain`, tested with Jest (`npm test`). Anything that depends on the current date receives it as an argument.

- `expirationStatus(product, now)`: `expired`, `soon` (7 days or less), `upcoming` (under 30 days) or `safe`, from calendar days, so the time of day does not matter.
- `filterProducts`: by category and by name, ignoring case and accents.
- `groupByExpiration`: "expiring soon" (including expired) and the rest, each sorted by date.

## Example

`example/` is an Expo showcase that renders `HomeNavigator` on its own, without the host app, so the module can be tried independently. It imports the module from `../src`. Its `metro.config.js` resolves `react-native-screens` and `react-native-safe-area-context` from the example, which Expo pins to the versions its runtime ships.

```
cd example
npm install
npm start
```

## Status

The products screen follows the design: search, category chips, products grouped by expiration, favorite star and the add button. The filter button in the header is disabled until its behavior is decided. The product icon is the initial of its name until there are category illustrations. The add product screen is a form (category, name, number of packages, optional packaging and optional content of each package as a size with its unit, expiration date as DD/MM/YYYY) validated by pure functions in `domain/productForm.ts`; the photo of the design waits for the camera module. The products can be edited from the header menu: the edit mode changes the number of packages of each product and marks products for removal, and one save applies everything (the backend takes the counts and the removals as two all-or-nothing bulk calls). Favorites is still a placeholder.

## Build

`npm run build` inside the module.
