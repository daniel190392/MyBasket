import type { Session } from '../domain/types';
import type { SessionStorage } from '../domain/SessionStorage';

/**
 * Keeps the session in memory only. Meant for the mock backend and tests;
 * production needs an adapter backed by Keychain / Keystore supplied by the
 * host, because tokens must never sit in plain storage.
 */
export class InMemorySessionStorage implements SessionStorage {
  private session: Session | null = null;

  async load(): Promise<Session | null> {
    return this.session;
  }

  async save(session: Session): Promise<void> {
    this.session = session;
  }

  async clear(): Promise<void> {
    this.session = null;
  }
}
