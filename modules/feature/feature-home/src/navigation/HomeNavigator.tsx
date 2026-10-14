import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, textPresets } from 'ui-components';

import { AddProductScreen } from '../screens/AddProductScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { homeStrings } from '../screens/strings';
import type { HomeStackParamList, HomeTabParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: homeStrings.productsTab }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: homeStrings.favoritesTab }}
      />
    </Tab.Navigator>
  );
}

// The tree is independent of the host and of any other embedded feature: this
// is the "app inside a larger app" case React Navigation documents.
export function HomeNavigator() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTintColor: colors.primary,
            headerTitleStyle: { ...textPresets.title, color: colors.primary },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Tabs"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ title: homeStrings.addProductTitle }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
