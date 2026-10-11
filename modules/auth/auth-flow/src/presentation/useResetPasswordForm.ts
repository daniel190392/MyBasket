import { useEffect, useState } from 'react';

import { useAuth } from '../application/useAuth';
import { isAuthError } from '../domain/errors';
import { validateResetPassword } from '../domain/validation';

import type { AuthErrorCode } from '../domain/errors';
import type { ResetPasswordFieldErrors } from '../domain/validation';

// Starts when the screen opens because the first code was just sent.
const RESEND_COOLDOWN_SECONDS = 30;
const COUNTDOWN_TICK_MS = 1000;

export const useResetPasswordForm = (
  email: string,
  onPasswordReset: () => void
) => {
  const { confirmPasswordRecovery, requestPasswordRecovery } = useAuth();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
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
    const errors = validateResetPassword({
      code,
      newPassword,
      confirmPassword,
    });
    setFieldErrors(errors);
    setSubmitErrorCode(null);
    setIsCodeResent(false);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await confirmPasswordRecovery({
        email,
        code: code.trim(),
        newPassword,
      });
      onPasswordReset();
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
      await requestPasswordRecovery(email);
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
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
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
