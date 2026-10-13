/**
 * Encrypted key-value storage. Values are encrypted with a key that never
 * leaves the platform secure store.
 *
 * Keys are shared by every module that uses the store, so prefix them with the
 * module name (for example `auth.session`) to avoid collisions.
 */
export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
