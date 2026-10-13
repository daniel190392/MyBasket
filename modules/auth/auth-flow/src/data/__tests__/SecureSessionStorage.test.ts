import { SecureSessionStorage } from '../SecureSessionStorage';

import type { KeyValueStore } from '../../domain/KeyValueStore';
import type { Session } from '../../domain/types';

const SESSION_KEY = 'auth.session';

const session: Session = {
  user: { id: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
  accessToken: 'access-token',
};

class FakeKeyValueStore implements KeyValueStore {
  readonly entries = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.entries.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.entries.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.entries.delete(key);
  }
}

describe('SecureSessionStorage', () => {
  let store: FakeKeyValueStore;
  let storage: SecureSessionStorage;

  beforeEach(() => {
    store = new FakeKeyValueStore();
    storage = new SecureSessionStorage(store);
  });

  it('loads nothing when no session was saved', async () => {
    await expect(storage.load()).resolves.toBeNull();
  });

  it('loads the session it saved', async () => {
    await storage.save(session);

    await expect(storage.load()).resolves.toEqual(session);
  });

  it('keeps the session under the auth-prefixed key', async () => {
    await storage.save(session);

    expect(store.entries.has(SESSION_KEY)).toBe(true);
    expect(store.entries.size).toBe(1);
  });

  it('forgets the session on clear', async () => {
    await storage.save(session);
    await storage.clear();

    await expect(storage.load()).resolves.toBeNull();
  });

  it('rejects a stored value that is not valid JSON', async () => {
    store.entries.set(SESSION_KEY, 'not json');

    await expect(storage.load()).rejects.toThrow();
  });

  it('rejects a stored value that is not a session', async () => {
    store.entries.set(SESSION_KEY, JSON.stringify({ accessToken: 'token' }));

    await expect(storage.load()).rejects.toThrow('malformed');
  });

  it('propagates a store failure so the service can recover', async () => {
    const failure = new Error('decrypt-failed');
    store.getItem = () => Promise.reject(failure);

    await expect(storage.load()).rejects.toBe(failure);
  });
});
