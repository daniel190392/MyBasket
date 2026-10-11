import { useEffect, useState } from 'react';

import { useAuth } from '../application/useAuth';
import { isAuthError } from '../domain/errors';
import { validateConfirmationCode } from '../domain/validation';

import type { AuthErrorCode } from '../domain/errors';
import type { ConfirmationFieldErrors } from '../domain/validation';

// Starts when the screen opens because the first code was just sent.
const RESEND_COOLDOWN_SECONDS = 30;
const COUNTDOWN_TICK_MS = 1000;

export const useConfirmationForm = (email: string, onConfirmed: () => void) => {
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ConfirmationFieldErrors>({});
  const [submitErrorCode, setSubmitErrorCode] = useState<AuthErrorCode | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCodeResent, setIsCodeResent] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(
    RESEND_COOLDOWN_SECONDS
  );

  useEffect(() => {
    if (resendSecondsLeft === 0) return;
    const timeout = setTimeout(
      () => setResendSecondsLeft((seconds) => seconds - 1),
      COUNTDOWN_TICK_MS
    );
    return () => clearTimeout(timeout);
  }, [resendSecondsLeft]);

  const canResend = resendSecondsLeft === 0 && !isResending;

  const submit = async () => {
    const errors = validateConfirmationCode(code);
    setFieldErrors(errors);
    setSubmitErrorCode(null);
    setIsCodeResent(false);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await confirmSignUp({ email, code: code.trim() });
      onConfirmed();
    } catch (error) {
      setSubmitErrorCode(isAuthError(error) ? error.code : 'unknown');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (!canResend) return;

    setSubmitErrorCode(null);
    setIsCodeResent(false);
    setIsResending(true);
    // Restarted even if the request fails: the backend throttles resends too.
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    try {
      await resendConfirmationCode(email);
      setIsCodeResent(true);
    } catch (error) {
      setSubmitErrorCode(isAuthError(error) ? error.code : 'unknown');
    } finally {
      setIsResending(false);
    }
  };

  return {
    code,
    setCode,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    isCodeResent,
    resendSecondsLeft,
    canResend,
    submit,
    resend,
  };
};
