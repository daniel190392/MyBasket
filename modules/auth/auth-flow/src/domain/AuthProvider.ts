import type { Credentials, Session } from './types';

/**
 * Contract with the authentication backend. The mock and the real backend
 * are interchangeable adapters of this port.
 */
export interface AuthProvider {
  signIn(credentials: Credentials): Promise<Session>;
  signOut(session: Session): Promise<void>;
}
