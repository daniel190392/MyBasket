import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PIcon, colors, iconSize, textPresets } from 'ui-components';

import { AddProductScreen } from '../screens/AddProductScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { homeStrings } from '../screens/strings';
import { ProductsProvider } from '../state/ProductsProvider';
import type { ProductRepository } from '../domain/ProductRepository';
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
        options={{
          title: homeStrings.productsTab,
          tabBarIcon: ({ color }) => (
            <PIcon name="store" size={iconSize.lg} color={color} />
          ),
        }}
      >
        {({ navigation }) => (
          <ProductsScreen
            onAddProductPress={() =>
              navigation.getParent()?.navigate('AddProduct')
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: homeStrings.favoritesTab,
          tabBarIcon: ({ color, focused }) => (
            <PIcon
              name="star"
              size={iconSize.lg}
              color={color}
              filled={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export type HomeNavigatorProps = {
  productRepository: ProductRepository;
};

// The tree is independent of the host and of any other embedded feature: this
// is the "app inside a larger app" case React Navigation documents.
export function HomeNavigator({ productRepository }: HomeNavigatorProps) {
  return (
    <ProductsProvider repository={productRepository}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerTintColor: colors.primary,
              headerTitleStyle: {
                ...textPresets.title,
                color: colors.primary,
              },
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
              options={{ title: homeStrings.addProductTitle }}
            >
              {({ navigation }) => (
                <AddProductScreen onProductAdded={navigation.goBack} />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </ProductsProvider>
  );
}
