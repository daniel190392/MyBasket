# feature-side-menu

Side menu for the app: a panel that slides in from the left over the current screen, with the user and the account actions. Today it shows the user's name and **Cerrar sesión**; the options are meant to grow, which is why the module is named after the menu and not after one of its options.

## What it is and what it is not

- One component, `SideMenu`. It owns the panel, its animation and the scrim; it does not own the session, the navigation or the screen that opens it.
- It does not depend on `auth-flow` nor on other features. The host gives it the user's name and the action to run, so the same menu works with any session.
- `feature-home` does not know about the menu either: its header only emits an `onMenuPress` event, and the host connects that event to `isOpen` (see [Usage](#usage)).

## Usage

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);

<HomeNavigator
  productRepository={repository}
  onMenuPress={() => setIsMenuOpen(true)}
/>
<SideMenu
  isOpen={isMenuOpen}
  userName={session.user.displayName}
  onClose={() => setIsMenuOpen(false)}
  onSignOutPress={signOut}
/>
```

Tapping outside the panel and the Android back button call `onClose`. `onSignOutPress` does not close the menu: what happens next belongs to the host.

## How it is built

```
src/
  SideMenu.tsx             The panel, the scrim and the sign out button
  useSideMenuAnimation.ts  Open/close progress; keeps the menu rendered until it slides out
  strings.ts               User-facing text
  domain/userInitial.ts    The letter shown in the avatar (pure, with tests)
example/                   Expo showcase that opens the menu without the host
```

- It is drawn inside a React Native `Modal`, so it stays above the host's chrome and Android back works without a navigation library. The slide uses `Animated` with the native driver: no drawer library and no native dependency beyond `react-native-safe-area-context`.
- UI comes from `ui-components` (`PButton` with its `icon`, tokens).

## Testing

`npm test` runs the Jest suite (`userInitial`). The panel itself is checked in `example/` and in the host. Build: `npm run build`.
