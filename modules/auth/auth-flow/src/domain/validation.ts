import type { Credentials } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CredentialsFieldError = 'required' | 'invalid-email';

export type CredentialsFieldErrors = Partial<
  Record<keyof Credentials, CredentialsFieldError>
>;

export const validateCredentials = ({
  email,
  password,
}: Credentials): CredentialsFieldErrors => {
  const errors: CredentialsFieldErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'required';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'invalid-email';
  }

  if (!password) {
    errors.password = 'required';
  }

  return errors;
};
