import React from 'react';
import { StatusBar } from 'react-native';

import { HomeNavigator } from '../src';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <HomeNavigator />
    </>
  );
}
