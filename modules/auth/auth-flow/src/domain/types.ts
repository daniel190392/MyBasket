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
};

/**
 * Outcome of a sign up. A backend that verifies the email first cannot return
 * a session yet: the user has to confirm the account before signing in.
 */
export type SignUpResult =
  | { status: 'signedIn'; session: Session }
  | { status: 'confirmationRequired'; email: string };
