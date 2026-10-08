import type { Credentials, Registration, Session, SignUpResult } from './types';

/**
 * Contract with the authentication backend. The mock and the real backend
 * are interchangeable adapters of this port.
 */
export interface AuthProvider {
  signIn(credentials: Credentials): Promise<Session>;
  signUp(registration: Registration): Promise<SignUpResult>;
  signOut(session: Session): Promise<void>;
  /** Sends the recovery instructions to the email, if an account exists. */
  requestPasswordRecovery(email: string): Promise<void>;
}
