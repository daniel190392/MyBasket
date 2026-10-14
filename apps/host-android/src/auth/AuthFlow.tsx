import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { LoginScreen, PasswordRecoveryFlow, SignUpFlow } from 'auth-flow';

type AuthScreen = 'login' | 'signUp' | 'recovery';

export function AuthFlow() {
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
