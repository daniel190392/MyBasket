export type Credentials = {
  email: string;
  password: string;
};

export type Registration = {
  email: string;
  password: string;
  displayName: string;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type Session = {
  user: AuthUser;
  accessToken: string;
  /** Long-lived credential used only to obtain a new access token. */
  refreshToken: string;
  /** Instant the access token stops being valid, in milliseconds since the epoch. */
  accessTokenExpiresAt: number;
};

export type SignUpConfirmation = {
  email: string;
  code: string;
};

export type PasswordRecoveryConfirmation = {
  email: string;
  code: string;
  newPassword: string;
};

export type SignUpResult =
  | { status: 'signedIn'; session: Session }
  | { status: 'confirmationRequired'; email: string };
