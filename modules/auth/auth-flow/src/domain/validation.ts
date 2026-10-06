import type { Credentials, Registration } from './types';

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

export type RegistrationInput = Registration & { confirmPassword: string };

export type RegistrationFieldError =
  CredentialsFieldError | 'passwords-mismatch';

export type RegistrationFieldErrors = Partial<
  Record<keyof RegistrationInput, RegistrationFieldError>
>;

export const validateRegistration = ({
  email,
  password,
  confirmPassword,
  displayName,
}: RegistrationInput): RegistrationFieldErrors => {
  const errors: RegistrationFieldErrors = validateCredentials({
    email,
    password,
  });

  if (!confirmPassword) {
    errors.confirmPassword = 'required';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'passwords-mismatch';
  }

  if (!displayName.trim()) {
    errors.displayName = 'required';
  }

  return errors;
};
