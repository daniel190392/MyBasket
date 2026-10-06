import { useState } from 'react';

import { useAuth } from '../application/useAuth';
import { isAuthError } from '../domain/errors';
import { validateRecovery } from '../domain/validation';

import type { AuthErrorCode } from '../domain/errors';
import type { RecoveryFieldErrors } from '../domain/validation';

export const useRecoveryForm = () => {
  const { requestPasswordRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RecoveryFieldErrors>({});
  const [submitErrorCode, setSubmitErrorCode] = useState<AuthErrorCode | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const submit = async () => {
    const errors = validateRecovery(email);
    setFieldErrors(errors);
    setSubmitErrorCode(null);
    setIsRequestSent(false);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await requestPasswordRecovery(email.trim());
      setIsRequestSent(true);
    } catch (error) {
      setSubmitErrorCode(isAuthError(error) ? error.code : 'unknown');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    isRequestSent,
    submit,
  };
};
