import React, { useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from 'auth-flow';
import { HomeNavigator } from 'feature-home';
import { SideMenu } from 'feature-side-menu';

import { AuthSessionRoot } from '../auth/AuthSessionRoot';
import { CenteredMessage } from '../components/CenteredMessage';
import { CenteredSpinner } from '../components/CenteredSpinner';
import { useReportHostEvent } from '../native/useReportHostEvent';
import { getProductRepositorySetup } from './sharedProductRepository';

import type {
  HomeConfig,
  ProductRepositorySetup,
} from './sharedProductRepository';

// The home does not know about the session; this root watches it so the native
// host takes the user back to the login when it ends (signing out or expiring).
function HomeGate({ setup }: { setup: ProductRepositorySetup }) {
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasFailed = useReportHostEvent(
    'signedOut',
    auth.status === 'signedOut'
  );

  if (hasFailed) {
    return (
      <CenteredMessage
        title="Could not continue"
        caption="The app could not return to the login. Restart it and try again."
      />
    );
  }

  if (auth.status !== 'signedIn') return <CenteredSpinner />;

  if (!('repository' in setup)) {
    return (
      <CenteredMessage
        title="Products are not configured"
        caption={setup.problem}
      />
    );
  }

  return (
    <>
      <HomeNavigator
        productRepository={setup.repository}
        onMenuPress={() => setIsMenuOpen(true)}
      />
      <SideMenu
        isOpen={isMenuOpen}
        userName={auth.session.user.displayName}
        onClose={() => setIsMenuOpen(false)}
        onSignOutPress={auth.signOut}
      />
    </>
  );
}

export function HomeRoot({ apiBaseUrl, ...authConfig }: HomeConfig) {
  const { clientId, endpoint } = authConfig;
  const setup = useMemo(
    () => getProductRepositorySetup({ clientId, endpoint, apiBaseUrl }),
    [clientId, endpoint, apiBaseUrl]
  );

  return (
    <SafeAreaProvider>
      <AuthSessionRoot {...authConfig}>
        <HomeGate setup={setup} />
      </AuthSessionRoot>
    </SafeAreaProvider>
  );
}
