import type {
  Credentials,
  Registration,
  Session,
  SignUpConfirmation,
  SignUpResult,
} from './types';

/**
 * Contract with the authentication backend. The mock and the real backend
 * are interchangeable adapters of this port.
 */
export interface AuthProvider {
  signIn(credentials: Credentials): Promise<Session>;
  signUp(registration: Registration): Promise<SignUpResult>;
  signOut(session: Session): Promise<void>;
  /** Confirms the account created by a sign up that needs email verification. */
  confirmSignUp(confirmation: SignUpConfirmation): Promise<void>;
  /** Sends a new confirmation code to the email. */
  resendConfirmationCode(email: string): Promise<void>;
  /** Sends the recovery instructions to the email, if an account exists. */
  requestPasswordRecovery(email: string): Promise<void>;
}
