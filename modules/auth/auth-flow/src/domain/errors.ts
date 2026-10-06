export type AuthErrorCode = 'invalid-credentials' | 'network' | 'unknown';

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
