import { useState } from 'react';

import { useAuth } from '../application/useAuth';
import { isAuthError } from '../domain/errors';
import { validateRegistration } from '../domain/validation';

import type { AuthErrorCode } from '../domain/errors';
import type { RegistrationFieldErrors } from '../domain/validation';

export const useRegisterForm = (
  onConfirmationRequired: (email: string) => void
) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [submitErrorCode, setSubmitErrorCode] = useState<AuthErrorCode | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const errors = validateRegistration({
      email,
      password,
      confirmPassword,
      displayName,
    });
    setFieldErrors(errors);
    setSubmitErrorCode(null);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await signUp({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
      });
      if (result.status === 'confirmationRequired') {
        onConfirmationRequired(result.email);
      }
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
    confirmPassword,
    setConfirmPassword,
    displayName,
    setDisplayName,
    fieldErrors,
    submitErrorCode,
    isSubmitting,
    submit,
  };
};
