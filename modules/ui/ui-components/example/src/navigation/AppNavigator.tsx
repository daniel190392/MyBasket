import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { CATALOG_ITEMS } from './catalogConfig';
import { CatalogScreenName, RootStackParamList } from './types';
import {
  HomeScreen,
  ButtonScreen,
  BadgeScreen,
  CardScreen,
  InputScreen,
  LinkScreen,
  IconScreen,
  ChipScreen,
} from '../screens';

// Learning note: the catalog is data-driven. Each CATALOG_ITEMS entry stores a
// screen name, and this map resolves it to the component to render. Typing the
// keys as CatalogScreenName makes TypeScript fail if a catalog item has no
// screen (similar to switching exhaustively over a Swift enum).
const SCREEN_COMPONENTS: Record<CatalogScreenName, React.ComponentType> = {
  ButtonScreen,
  InputScreen,
  BadgeScreen,
  CardScreen,
  LinkScreen,
  IconScreen,
  ChipScreen,
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Home">
    {/*
      Learning note: `component` takes a component reference, and React
      Navigation instantiates it and injects the `navigation` and `route` props
      (comparable to a UINavigationController creating the view controller).
      The alternative is to pass the screen as a render-function child, which
      lets you hand it custom props but creates a new function on every render:

      <Stack.Screen name="Home">
        {(props) => <HomeScreen {...props} />}
      </Stack.Screen>
    */}
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'UI Components' }}
    />
    {CATALOG_ITEMS.map((item) => (
      <Stack.Screen
        key={item.id}
        name={item.screenName}
        component={SCREEN_COMPONENTS[item.screenName]}
        options={{ title: item.title }}
      />
    ))}
  </Stack.Navigator>
);
