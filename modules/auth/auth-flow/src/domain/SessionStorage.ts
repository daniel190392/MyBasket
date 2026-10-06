import type { Session } from './types';

/**
 * Persistence of the current session between app launches.
 */
export interface SessionStorage {
  load(): Promise<Session | null>;
  save(session: Session): Promise<void>;
  clear(): Promise<void>;
}
