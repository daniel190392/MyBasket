import type { AuthProvider } from '../domain/AuthProvider';
import type { SessionStorage } from '../domain/SessionStorage';
import type { Credentials, Registration, Session } from '../domain/types';

/**
 * Authentication use cases. Plain TypeScript with no React, so the host can
 * also use it from non-React code (for example to read the access token).
 */
export class AuthService {
  constructor(
    private readonly provider: AuthProvider,
    private readonly storage: SessionStorage
  ) {}

  async restoreSession(): Promise<Session | null> {
    try {
      return await this.storage.load();
    } catch {
      // An unreadable stored session must not lock the user out.
      await this.storage.clear();
      return null;
    }
  }

  async signIn(credentials: Credentials): Promise<Session> {
    const session = await this.provider.signIn(credentials);
    await this.storage.save(session);
    return session;
  }

  async signUp(registration: Registration): Promise<Session> {
    const session = await this.provider.signUp(registration);
    await this.storage.save(session);
    return session;
  }

  async requestPasswordRecovery(email: string): Promise<void> {
    await this.provider.requestPasswordRecovery(email);
  }

  async signOut(session: Session): Promise<void> {
    try {
      await this.provider.signOut(session);
    } finally {
      await this.storage.clear();
    }
  }
}
