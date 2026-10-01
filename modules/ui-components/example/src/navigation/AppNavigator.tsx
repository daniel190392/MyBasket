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
} from '../screens';

const SCREEN_COMPONENTS: Record<CatalogScreenName, React.ComponentType> = {
  ButtonScreen,
  InputScreen,
  BadgeScreen,
  CardScreen,
  LinkScreen,
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Home">
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
