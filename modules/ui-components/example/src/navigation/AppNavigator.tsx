import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { RootStackParamList } from './types';
import { CATALOG_ITEMS } from './catalogConfig';
import { HomeScreen, ButtonScreen } from '../screens/index';

const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  ButtonScreen: ButtonScreen,
  // InputScreen: InputScreen,
  // CardScreen: CardScreen,
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Pantry Components' }}
      />

      {CATALOG_ITEMS.map((item) => {
        const Component = SCREEN_COMPONENTS[item.screenName];

        if (!Component) return null;

        return (
          <Stack.Screen
            key={item.id}
            name={item.screenName}
            component={Component}
            options={{ title: item.title }}
          />
        );
        /* Alternative when you want to specify the HomeScreen as child
        <Stack.Screen
          name="Home"
          options={{ title: 'PantryHub UI' }}
        >
          {() => <HomeScreen />}
        </Stack.Screen>;*/
      })}
    </Stack.Navigator>
  );
};
