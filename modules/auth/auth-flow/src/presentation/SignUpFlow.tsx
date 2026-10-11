import React, { useState } from 'react';

import { ConfirmationScreen } from './ConfirmationScreen';
import { RegisterScreen } from './RegisterScreen';

import type { ImageSourcePropType } from 'react-native';

export type SignUpFlowProps = {
  logo?: ImageSourcePropType;
  /** Starts at the confirmation step, for an account never confirmed. */
  initialEmailToConfirm?: string;
  /** The account was confirmed; the user can sign in with this email. */
  onFinished: (email: string) => void;
  /** The user left the flow without confirming the account. */
  onSignInPress: () => void;
};

export function SignUpFlow({
  logo,
  initialEmailToConfirm,
  onFinished,
  onSignInPress,
}: SignUpFlowProps) {
  const [emailToConfirm, setEmailToConfirm] = useState<string | null>(
    initialEmailToConfirm ?? null
  );

  if (emailToConfirm) {
    return (
      <ConfirmationScreen
        logo={logo}
        email={emailToConfirm}
        onConfirmed={() => onFinished(emailToConfirm)}
        onBackPress={onSignInPress}
      />
    );
  }

  return (
    <RegisterScreen
      logo={logo}
      onSignInPress={onSignInPress}
      onConfirmationRequired={setEmailToConfirm}
    />
  );
}
