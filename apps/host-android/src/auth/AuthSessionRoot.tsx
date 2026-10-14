import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthSessionProvider } from 'auth-flow';
import { colors } from 'ui-components';

import { CenteredMessage } from '../components/CenteredMessage';
import { getAuthSetup } from './sharedAuthService';

import type { AuthConfig } from './sharedAuthService';

type AuthSessionRootProps = AuthConfig & {
  children: ReactNode;
};

// Gives a root the shared auth service, or explains why there is none.
export function AuthSessionRoot({
  clientId,
  endpoint,
  children,
}: AuthSessionRootProps) {
  const setup = useMemo(
    () => getAuthSetup({ clientId, endpoint }),
    [clientId, endpoint]
  );

  if (!('service' in setup)) {
    return (
      <CenteredMessage
        title="Auth is not configured"
        caption={setup.problem}
      />
    );
  }

  return (
    <View style={styles.flex}>
      <AuthSessionProvider service={setup.service}>
        {children}
      </AuthSessionProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
