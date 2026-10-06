import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PButton, colors, spacing, textPresets } from 'ui-components';

import {
  DEFAULT_MOCK_USERS,
  LoginScreen,
  RecoveryScreen,
  RegisterScreen,
  useAuth,
} from '../../src';

type AuthScreen = 'login' | 'register' | 'recovery';

const [demoUser] = DEFAULT_MOCK_USERS;

export function AuthGate() {
  const auth = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');

  if (auth.status === 'restoring') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (auth.status === 'signedIn') {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Hello, {auth.session.user.displayName}</Text>
        <Text style={styles.hint}>{auth.session.user.email}</Text>
        <PButton title="Sign out" variant="secondary" onPress={auth.signOut} />
      </View>
    );
  }

  if (screen === 'register') {
    return <RegisterScreen onSignInPress={() => setScreen('login')} />;
  }

  if (screen === 'recovery') {
    return <RecoveryScreen onSignInPress={() => setScreen('login')} />;
  }

  return (
    <View style={styles.flex}>
      <LoginScreen
        onForgotPasswordPress={() => setScreen('recovery')}
        onSignUpPress={() => setScreen('register')}
      />
      <View style={styles.footer}>
        <Text style={styles.hint}>
          Mock credentials: {demoUser.email} / {demoUser.password}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...textPresets.title,
  },
  hint: {
    ...textPresets.caption,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
});
