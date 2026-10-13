import type { Session, SessionStorage } from 'auth-flow';

// Placeholder until a secure storage (Keystore-backed) is implemented: the
// session lives only as long as the app process.
export class NoopSessionStorage implements SessionStorage {
  async load(): Promise<Session | null> {
    return null;
  }

  async save(): Promise<void> {}

  async clear(): Promise<void> {}
}
