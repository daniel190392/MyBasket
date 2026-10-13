import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PButton, colors, spacing, textPresets } from 'ui-components';
import {
  AuthService,
  AuthSessionProvider,
  LoginScreen,
  PasswordRecoveryFlow,
  RemoteAuthProvider,
  SecureSessionStorage,
  SignUpFlow,
  useAuth,
} from 'auth-flow';
import { secureStorage } from 'secure-storage';

type AuthScreen = 'login' | 'signUp' | 'recovery';

function AuthGate() {
  const auth = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [emailToConfirm, setEmailToConfirm] = useState<string | null>(null);

  // Leaving a flow is the host's call: back returns to login, and on login the
  // system default (leaving the screen) applies.
  useEffect(() => {
    if (screen === 'login') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setScreen('login');
        return true;
      }
    );
    return () => subscription.remove();
  }, [screen]);

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
        <Text style={styles.caption}>{auth.session.user.email}</Text>
        <PButton title="Sign out" variant="secondary" onPress={auth.signOut} />
      </View>
    );
  }

  if (screen === 'signUp') {
    return (
      <SignUpFlow
        initialEmailToConfirm={emailToConfirm ?? undefined}
        onFinished={(email) => {
          setConfirmedEmail(email);
          setScreen('login');
        }}
        onSignInPress={() => setScreen('login')}
      />
    );
  }

  if (screen === 'recovery') {
    return (
      <PasswordRecoveryFlow
        onFinished={() => setScreen('login')}
        onSignInPress={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginScreen
      initialEmail={confirmedEmail ?? undefined}
      onForgotPasswordPress={() => setScreen('recovery')}
      onConfirmationRequired={(email) => {
        setEmailToConfirm(email);
        setScreen('signUp');
      }}
      onSignUpPress={() => {
        setEmailToConfirm(null);
        setScreen('signUp');
      }}
    />
  );
}

export type AuthViewProps = {
  clientId?: string;
  endpoint?: string;
};

export function AuthView({ clientId, endpoint }: AuthViewProps) {
  const service = useMemo(() => {
    if (!clientId || !endpoint) return null;
    return new AuthService(
      new RemoteAuthProvider({ clientId, endpoint }),
      new SecureSessionStorage(secureStorage)
    );
  }, [clientId, endpoint]);

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Auth is not configured</Text>
        <Text style={styles.caption}>
          Set auth.clientId and auth.endpoint in local.properties (see
          local.properties.example).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AuthSessionProvider service={service}>
        <AuthGate />
      </AuthSessionProvider>
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
  caption: {
    ...textPresets.caption,
    textAlign: 'center',
  },
});
