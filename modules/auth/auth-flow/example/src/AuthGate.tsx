import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PButton, colors, spacing, textPresets } from 'ui-components';

import {
  DEFAULT_MOCK_USERS,
  LoginScreen,
  MOCK_CONFIRMATION_CODE,
  PasswordRecoveryFlow,
  SignUpFlow,
  useAuth,
} from '../../src';

type AuthScreen = 'login' | 'signUp' | 'recovery';

const [demoUser] = DEFAULT_MOCK_USERS;

export function AuthGate() {
  const auth = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

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

  if (screen === 'signUp') {
    return (
      <View style={styles.flex}>
        <SignUpFlow
          onFinished={(email) => {
            setConfirmedEmail(email);
            setScreen('login');
          }}
          onSignInPress={() => setScreen('login')}
        />
        <View style={styles.footer}>
          <Text style={styles.hint}>
            Mock confirmation code: {MOCK_CONFIRMATION_CODE}
          </Text>
        </View>
      </View>
    );
  }

  if (screen === 'recovery') {
    return (
      <View style={styles.flex}>
        <PasswordRecoveryFlow
          onFinished={() => setScreen('login')}
          onSignInPress={() => setScreen('login')}
        />
        <View style={styles.footer}>
          <Text style={styles.hint}>
            Mock recovery code: {MOCK_CONFIRMATION_CODE}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <LoginScreen
        initialEmail={confirmedEmail ?? undefined}
        onForgotPasswordPress={() => setScreen('recovery')}
        onSignUpPress={() => setScreen('signUp')}
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
