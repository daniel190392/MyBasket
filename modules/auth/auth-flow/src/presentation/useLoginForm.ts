import { useState } from 'react';

import { useAuth } from '../application/useAuth';
import { isAuthError } from '../domain/errors';
import { validateCredentials } from '../domain/validation';

import type { AuthErrorCode } from '../domain/errors';
import type { CredentialsFieldErrors } from '../domain/validation';

export const useLoginForm = (initialEmail = '') => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CredentialsFieldErrors>({});
  const [submitErrorCode, setSubmitErrorCode] = useState<AuthErrorCode | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const errors = validateCredentials({ email, password });
    setFieldErrors(errors);
    setSubmitErrorCode(null);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      setSubmitErrorCode(isAuthError(error) ? error.code : 'unknown');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    submit,
  };
};
