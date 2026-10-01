import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { CATALOG_ITEMS } from './catalogConfig';
import { CatalogScreenName, RootStackParamList } from './types';
import {
  HomeScreen,
  FadeInScreen,
  PressableScaleScreen,
  PulseScreen,
  SkeletonScreen,
  SpinnerScreen,
} from '../screens';

const SCREEN_COMPONENTS: Record<CatalogScreenName, React.ComponentType> = {
  FadeInScreen,
  PressableScaleScreen,
  PulseScreen,
  SkeletonScreen,
  SpinnerScreen,
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Animated Components' }}
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
