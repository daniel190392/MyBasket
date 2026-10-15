import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';

import { HomeNavigator } from '../src';
import { InMemoryProductRepository } from '../src/testing/InMemoryProductRepository';

export default function App() {
  const productRepository = useMemo(() => new InMemoryProductRepository(), []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <HomeNavigator productRepository={productRepository} />
    </>
  );
}
