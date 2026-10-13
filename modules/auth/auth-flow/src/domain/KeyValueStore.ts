/**
 * A minimal key-value store of text. It is a port: the host supplies an
 * implementation backed by the platform secure store, so this module does not
 * depend on any storage library.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
