export type AuthErrorCode =
  | 'invalid-credentials'
  | 'user-not-confirmed'
  | 'email-already-in-use'
  | 'weak-password'
  | 'invalid-code'
  | 'expired-code'
  | 'too-many-requests'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string = code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const isAuthError = (error: unknown): error is AuthError =>
  error instanceof AuthError;
