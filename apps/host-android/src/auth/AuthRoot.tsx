import React from 'react';
import { useAuth } from 'auth-flow';

import { CenteredMessage } from '../components/CenteredMessage';
import { CenteredSpinner } from '../components/CenteredSpinner';
import { useReportHostEvent } from '../native/useReportHostEvent';
import { AuthFlow } from './AuthFlow';
import { AuthSessionRoot } from './AuthSessionRoot';

import type { AuthConfig } from './sharedAuthService';

// The native host starts here: while the session is restored the user sees the
// spinner, and a restored or new session is reported so the host opens the home.
function AuthGate() {
  const auth = useAuth();
  const hasFailed = useReportHostEvent('signedIn', auth.status === 'signedIn');

  if (hasFailed) {
    return (
      <CenteredMessage
        title="Could not continue"
        caption="The app could not open the home. Restart it and try again."
      />
    );
  }

  if (auth.status === 'signedOut') return <AuthFlow />;

  return <CenteredSpinner />;
}

export function AuthRoot(props: AuthConfig) {
  return (
    <AuthSessionRoot {...props}>
      <AuthGate />
    </AuthSessionRoot>
  );
}
