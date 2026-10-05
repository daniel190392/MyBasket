import React from 'react';
import { StatusBar } from 'react-native';

import {
  AuthService,
  AuthSessionProvider,
  InMemorySessionStorage,
  MockAuthProvider,
} from '../src';
import { AuthGate } from './src/AuthGate';

// Built once, outside the component: switching to the real backend means
// replacing MockAuthProvider here, nothing else.
const authService = new AuthService(
  new MockAuthProvider(),
  new InMemorySessionStorage()
);

export default function App() {
  return (
    <AuthSessionProvider service={authService}>
      <StatusBar barStyle="dark-content" />
      <AuthGate />
    </AuthSessionProvider>
  );
}
