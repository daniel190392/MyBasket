import { isAuthError } from '../domain/errors';
import { shouldRenewAccessToken } from '../domain/sessionExpiry';

import type { AuthProvider } from '../domain/AuthProvider';
import type { SessionStorage } from '../domain/SessionStorage';
import type {
  Credentials,
  PasswordRecoveryConfirmation,
  Registration,
  Session,
  SignUpConfirmation,
  SignUpResult,
} from '../domain/types';

/**
 * Authentication use cases. Plain TypeScript with no React, so the host can
 * also use it from non-React code (for example to read the access token).
 */
export class AuthService {
  constructor(
    private readonly provider: AuthProvider,
    private readonly storage: SessionStorage,
    private readonly now: () => number = Date.now
  ) {}

  async restoreSession(): Promise<Session | null> {
    const session = await this.loadStoredSession();
    if (!session || !shouldRenewAccessToken(session, this.now())) {
      return session;
    }
    return this.renewSession(session);
  }

  /**
   * The access token to send to the backend, renewed first when it is about
   * to expire. `null` means there is no session (never signed in, or the
   * backend rejected the refresh token). If the renewal fails for a transient
   * reason the stored token is returned anyway: the backend has the final word
   * on whether it is still valid.
   */
  async getAccessToken(): Promise<string | null> {
    const session = await this.restoreSession();
    return session?.accessToken ?? null;
  }

  async signIn(credentials: Credentials): Promise<Session> {
    const session = await this.provider.signIn(credentials);
    await this.storage.save(session);
    return session;
  }

  async signUp(registration: Registration): Promise<SignUpResult> {
    const result = await this.provider.signUp(registration);
    if (result.status === 'signedIn') {
      await this.storage.save(result.session);
    }
    return result;
  }

  async confirmSignUp(confirmation: SignUpConfirmation): Promise<void> {
    await this.provider.confirmSignUp(confirmation);
  }

  async resendConfirmationCode(email: string): Promise<void> {
    await this.provider.resendConfirmationCode(email);
  }

  async requestPasswordRecovery(email: string): Promise<void> {
    await this.provider.requestPasswordRecovery(email);
  }

  async confirmPasswordRecovery(
    confirmation: PasswordRecoveryConfirmation
  ): Promise<void> {
    await this.provider.confirmPasswordRecovery(confirmation);
  }

  async signOut(session: Session): Promise<void> {
    try {
      await this.provider.signOut(session);
    } finally {
      await this.storage.clear();
    }
  }

  private async loadStoredSession(): Promise<Session | null> {
    try {
      return await this.storage.load();
    } catch {
      // An unreadable stored session must not lock the user out.
      await this.storage.clear();
      return null;
    }
  }

  private async renewSession(session: Session): Promise<Session | null> {
    try {
      const renewed = await this.provider.refreshSession(session);
      await this.storage.save(renewed);
      return renewed;
    } catch (error) {
      if (isAuthError(error) && error.code === 'session-expired') {
        await this.storage.clear();
        return null;
      }
      // Anything else (no connection, a backend failure) says nothing about
      // the session, so it is kept instead of signing the user out for
      // something they did not do.
      return session;
    }
  }
}
