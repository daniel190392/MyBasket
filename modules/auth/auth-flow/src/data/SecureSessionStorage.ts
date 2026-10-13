import type { KeyValueStore } from '../domain/KeyValueStore';
import type { SessionStorage } from '../domain/SessionStorage';
import type { Session } from '../domain/types';

// Other modules share the same store, so the key carries the module prefix.
const SESSION_KEY = 'auth.session';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSession = (value: unknown): value is Session => {
  if (!isRecord(value) || !isRecord(value.user)) return false;
  const { user } = value;
  return (
    typeof value.accessToken === 'string' &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.displayName === 'string'
  );
};

/**
 * Persists the session as JSON in a key-value store. Pass a store backed by
 * the platform secure store: the session holds the access token.
 *
 * An unreadable or malformed value makes `load` throw; `AuthService` treats
 * that as "no session" and clears it, so the user only has to sign in again.
 */
export class SecureSessionStorage implements SessionStorage {
  constructor(private readonly store: KeyValueStore) {}

  async load(): Promise<Session | null> {
    const serialized = await this.store.getItem(SESSION_KEY);
    if (serialized === null) return null;

    const session: unknown = JSON.parse(serialized);
    if (!isSession(session)) {
      throw new Error('The stored session is malformed');
    }
    return session;
  }

  async save(session: Session): Promise<void> {
    await this.store.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async clear(): Promise<void> {
    await this.store.removeItem(SESSION_KEY);
  }
}
