import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';

import { HomeNavigator } from '../src';
import { InMemoryProductRepository } from '../src/testing/InMemoryProductRepository';

// Smaller than the sample list, so the example shows loading more.
const EXAMPLE_PAGE_SIZE = 3;

export default function App() {
  const productRepository = useMemo(
    () => new InMemoryProductRepository({ pageSize: EXAMPLE_PAGE_SIZE }),
    []
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <HomeNavigator productRepository={productRepository} />
    </>
  );
}
