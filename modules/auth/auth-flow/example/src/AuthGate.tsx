import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PButton, colors, spacing, textPresets } from 'ui-components';

import {
  ConfirmationScreen,
  DEFAULT_MOCK_USERS,
  LoginScreen,
  MOCK_CONFIRMATION_CODE,
  RecoveryScreen,
  RegisterScreen,
  ResetPasswordScreen,
  useAuth,
} from '../../src';

type AuthScreen =
  'login' | 'register' | 'confirmation' | 'recovery' | 'resetPassword';

const [demoUser] = DEFAULT_MOCK_USERS;

export function AuthGate() {
  const auth = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [emailToConfirm, setEmailToConfirm] = useState<string | null>(null);
  const [emailToReset, setEmailToReset] = useState<string | null>(null);

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
    return (
      <RegisterScreen
        onSignInPress={() => setScreen('login')}
        onConfirmationRequired={(email) => {
          setEmailToConfirm(email);
          setScreen('confirmation');
        }}
      />
    );
  }

  if (screen === 'confirmation' && emailToConfirm) {
    return (
      <View style={styles.flex}>
        <ConfirmationScreen
          email={emailToConfirm}
          onConfirmed={() => setScreen('login')}
          onBackPress={() => setScreen('login')}
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
      <RecoveryScreen
        onSignInPress={() => setScreen('login')}
        onCodeSent={(email) => {
          setEmailToReset(email);
          setScreen('resetPassword');
        }}
      />
    );
  }

  if (screen === 'resetPassword' && emailToReset) {
    return (
      <View style={styles.flex}>
        <ResetPasswordScreen
          email={emailToReset}
          onPasswordReset={() => setScreen('login')}
          onBackPress={() => setScreen('login')}
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
        initialEmail={emailToConfirm ?? undefined}
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
