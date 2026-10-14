import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textPresets } from 'ui-components';
import {
  AuthService,
  AuthSessionProvider,
  RemoteAuthProvider,
  SecureSessionStorage,
  useAuth,
} from 'auth-flow';
import { secureStorage } from 'secure-storage';
import { AuthFlow } from './auth/AuthFlow';
import { HomePlaceholder } from './home/HomePlaceholder';

// The host decides what the user sees; modules only report their state.
function SessionGate() {
  const auth = useAuth();

  if (auth.status === 'restoring') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (auth.status === 'signedIn') {
    return (
      <HomePlaceholder
        displayName={auth.session.user.displayName}
        email={auth.session.user.email}
        onSignOutPress={auth.signOut}
      />
    );
  }

  return <AuthFlow />;
}

export type AppRootProps = {
  clientId?: string;
  endpoint?: string;
};

type AuthSetup = { service: AuthService } | { problem: string };

const MISSING_CONFIG_PROBLEM =
  'Set auth.clientId and auth.endpoint in local.properties (see local.properties.example).';

// An invalid setting (for example an http endpoint) is reported on screen
// instead of crashing the app while it renders.
function setUpAuth({ clientId, endpoint }: AppRootProps): AuthSetup {
  if (!clientId || !endpoint) return { problem: MISSING_CONFIG_PROBLEM };

  try {
    return {
      service: new AuthService(
        new RemoteAuthProvider({ clientId, endpoint }),
        new SecureSessionStorage(secureStorage)
      ),
    };
  } catch (error) {
    return {
      problem: error instanceof Error ? error.message : MISSING_CONFIG_PROBLEM,
    };
  }
}

export function AppRoot({ clientId, endpoint }: AppRootProps) {
  const setup = useMemo(
    () => setUpAuth({ clientId, endpoint }),
    [clientId, endpoint]
  );

  if (!('service' in setup)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Auth is not configured</Text>
        <Text style={styles.caption}>{setup.problem}</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AuthSessionProvider service={setup.service}>
        <SessionGate />
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
