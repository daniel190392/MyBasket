import type { Credentials, Registration } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CredentialsFieldError = 'required' | 'invalid-email';

export type CredentialsFieldErrors = Partial<
  Record<keyof Credentials, CredentialsFieldError>
>;

const validateEmail = (email: string): CredentialsFieldError | undefined => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return 'required';
  if (!EMAIL_PATTERN.test(trimmedEmail)) return 'invalid-email';
  return undefined;
};

export const validateCredentials = ({
  email,
  password,
}: Credentials): CredentialsFieldErrors => {
  const errors: CredentialsFieldErrors = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
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

export type RecoveryFieldErrors = Partial<
  Record<'email', CredentialsFieldError>
>;

export const validateRecovery = (email: string): RecoveryFieldErrors => {
  const emailError = validateEmail(email);
  return emailError ? { email: emailError } : {};
};

export const CONFIRMATION_CODE_LENGTH = 6;
const CONFIRMATION_CODE_PATTERN = new RegExp(
  `^\\d{${CONFIRMATION_CODE_LENGTH}}$`
);

export type ConfirmationFieldError = 'required' | 'invalid-code-format';

export type ConfirmationFieldErrors = Partial<
  Record<'code', ConfirmationFieldError>
>;

export const validateConfirmationCode = (
  code: string
): ConfirmationFieldErrors => {
  const trimmedCode = code.trim();
  if (!trimmedCode) return { code: 'required' };
  if (!CONFIRMATION_CODE_PATTERN.test(trimmedCode)) {
    return { code: 'invalid-code-format' };
  }
  return {};
};
