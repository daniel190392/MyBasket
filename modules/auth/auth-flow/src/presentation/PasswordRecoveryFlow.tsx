import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { RecoveryScreen } from './RecoveryScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';

import type { ImageSourcePropType } from 'react-native';

export type PasswordRecoveryFlowProps = {
  logo?: ImageSourcePropType;
  /** The password was changed; the user can sign in with the new one. */
  onFinished: () => void;
  /** The user left the flow without changing the password. */
  onSignInPress: () => void;
};

export function PasswordRecoveryFlow({
  logo,
  onFinished,
  onSignInPress,
}: PasswordRecoveryFlowProps) {
  const [emailToReset, setEmailToReset] = useState<string | null>(null);

  // Only the code step handles back: nothing was created on the server yet, so
  // returning to fix the email is safe. On the first step the host decides.
  useEffect(() => {
    if (!emailToReset) return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setEmailToReset(null);
        return true;
      }
    );
    return () => subscription.remove();
  }, [emailToReset]);

  if (emailToReset) {
    return (
      <ResetPasswordScreen
        logo={logo}
        email={emailToReset}
        onPasswordReset={onFinished}
        onBackPress={onSignInPress}
      />
    );
  }

  return (
    <RecoveryScreen
      logo={logo}
      onCodeSent={setEmailToReset}
      onSignInPress={onSignInPress}
    />
  );
}
