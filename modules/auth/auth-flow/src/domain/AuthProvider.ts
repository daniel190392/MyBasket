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
  confirmSignUp(confirmation: SignUpConfirmation): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  requestPasswordRecovery(email: string): Promise<void>;
}
