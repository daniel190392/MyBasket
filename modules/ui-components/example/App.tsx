import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from './src/screens/Home';
import { RootStackParamList } from './src/navigation/types';
import { colors, typography } from '../src';
import { StackScreen } from 'react-native-screens';

const Stack = createStackNavigator<RootStackParamList>();

const CallHomeScreen = () => <HomeScreen />;

const DummyButtonScreen = () => (
  <View style={styles.center}>
    <Text>Button Screen</Text>
  </View>
);

//

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontSize: typography.sizes.lg },
          }}
        >
          <Stack.Screen
            name="Home"
            // component={DummyButtonScreen} // CallHomeScreen Other alternative
            options={{ title: 'PantryHub UI' }}
          >
            {() => <HomeScreen />}
          </Stack.Screen>
          <Stack.Screen
            name="ButtonScreen"
            component={DummyButtonScreen}
            options={{ title: 'Button Component' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
